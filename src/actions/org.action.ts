'use server';

import { organizations } from "@/db/schema/organizations";
import { getOrgMembers, updateMemberStatus, getAllUsers } from "@/db/query/user.query";
import { getAllOrganizations, createOrganizationWithSchema } from "@/db/query/organization.query";
import { db } from "@/db";
import { invites, auditLogs } from "@/db/schema/logs";
import { sql, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { tc } from "@/lib/async";
import { ForbiddenError } from "@/lib/errors";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { CreateUserSchema } from "@/validations/admin.validation";
import axios from "axios";
import { getAuth0ManagementToken } from "@/lib/auth0.utility";
import { user } from "@/db/schema";

/**
 * Action for Org Admins to accept a user into their organization
 */
export async function acceptUserToOrg(targetUserId: string, role: "member" | "expert" | "org_admin" = "member") {
	const session = await getSession();
	
	// Security check: Only org_admins can accept users
	if (!session || session.user.role !== "org_admin") {
		throw new Error("Unauthorized: Only Org Admins can perform this action");
	}

	// Security check: Admins cannot change their own roles
	if (session.user.id === targetUserId) {
		throw new Error("You cannot change your own role");
	}

	const orgSlug = session.user.org_slug;
	if (!orgSlug) throw new Error("Admin is not associated with an organization");

	const result = await updateMemberStatus(targetUserId, orgSlug, role);
	
	revalidatePath("/dashboard/members");
	return { success: true, user: result };
}

/**
 * Action for Org Admins to deny a user from joining their organization
 */
export async function denyUserFromOrg(targetUserId: string) {
	const session = await getSession();
	
	// Security check: Only org_admins can deny users
	if (!session || session.user.role !== "org_admin") {
		throw new Error("Unauthorized: Only Org Admins can perform this action");
	}

	// Security check: Admins cannot remove themselves
	if (session.user.id === targetUserId) {
		throw new Error("You cannot remove yourself from the organization");
	}

	const orgSlug = session.user.org_slug;
	if (!orgSlug) throw new Error("Admin is not associated with an organization");

	const { updateUser } = await import("@/db/query/user.query");
	// Set their org_slug to null so they are no longer associated with the organization
	const result = await updateUser(targetUserId, { org_slug: null });
	
	revalidatePath("/dashboard/members");
	return { success: true, user: result };
}

/**
 * Fetch all members for the current admin's organization
 */
export async function getMyOrgMembers() {
	const session = await getSession();
	if (!session || !session.user.org_slug) return [];
	
	return await getOrgMembers(session.user.org_slug);
}

/**
 * Super Admin: Fetch all organizations on the platform
 */
export async function fetchAllOrganizations(slug?: string) {
	const session = await getSession();
	if (!session || session.user.role !== "super_admin") {
		throw new ForbiddenError("Only Super Admins can list organizations");
	}
	return await getAllOrganizations(slug);
}

/**
 * Super Admin: Fetch all users on the platform
 */
export async function fetchAllUsers(orgSlug?: string) {
	const session = await getSession();
	if (!session || session.user.role !== "super_admin") {
		throw new ForbiddenError("Only Super Admins can list users");
	}
	return await getAllUsers(orgSlug);
}

/**
 * Super Admin: Create a new organization and initialize its schema and admin
 */
export async function adminCreateOrganization(name: string, slug: string, adminEmail: string, plan: string = "Free") {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Super Admins can create organizations");
		}

		// Find the user who will be the org_admin
		const users = await getAllUsers();
		const adminUser = users.find(u => u.email === adminEmail);
		
		if (!adminUser) {
			throw new Error(`User with email ${adminEmail} not found. Please ensure they have registered first.`);
		}

		const org = await createOrganizationWithSchema(name, slug, adminUser.id, plan);
		
		revalidatePath("/admin", "layout");
		return { success: true, org };
	});
}

/**
 * Super Admin: Create a new user
 */
export async function adminCreateUser(data: CreateUserSchema) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Super Admins can create users");
		}

		const response = await auth.api.createUser({
			body: {
				email: data.email,
				password: data.password,
				name: data.name,
				role: data.role as any,
				data: {
					org_slug: data.org_slug || null,
				},
			},
			headers: await headers(),
		});

		if (!response) {
			throw new Error("Failed to create user");
		}

		revalidatePath("/admin", "layout");
		return { success: true, user: response.user };
	});
}

/**
 * Org Admin: Invite a new user directly into their organization
 */
export async function orgAdminInviteMember(data: { email: string; name: string; role: "member" | "expert"; password?: string }) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "org_admin") {
			throw new ForbiddenError("Only Organization Admins can invite members");
		}

		const orgSlug = session.user.org_slug;
		if (!orgSlug) throw new Error("Admin is not associated with an organization");

		if (!["member", "expert"].includes(data.role)) {
			throw new Error("Invalid role selection");
		}

		// In a real app, this would send an invite email. 
		// Here we're pre-creating the account directly to map with our setup.
		const response = await auth.api.createUser({
			body: {
				email: data.email,
				password: data.password || "Password123!", // Temp default password for pre-creation
				name: data.name,
				role: data.role as any,
				data: {
					org_slug: orgSlug,
				},
			},
			headers: await headers(),
		});

		if (!response) {
			throw new Error("Failed to invite member");
		}

		revalidatePath("/dashboard/members");
		return { success: true, user: response.user };
	});
}
/**
 * Super Admin: Update organization details
 */
export async function adminUpdateOrganization(id: number, data: { name?: string; slug?: string; plan?: string; type?: string }) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Super Admins can update organizations");
		}

		const { updateOrganization } = await import("@/db/query/organization.query");
		const org = await updateOrganization(id, data as any);
		
		revalidatePath("/admin", "layout");
		return { success: true, org };
	});
}

/**
 * Super Admin: Update user details
 */
export async function adminUpdateUser(id: string, data: { name?: string; role?: "user" | "member" | "expert" | "org_admin" | "super_admin"; org_slug?: string | null }) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Super Admins can update users");
		}

		const { updateUser } = await import("@/db/query/user.query");
		const user = await updateUser(id, data);

		revalidatePath("/admin", "layout");
		return { success: true, user };
	});
}

/**
 * Org Admin: Update their own organization details
 */
export async function actionUpdateOrgSettings(data: { 
	name?: string; 
	type?: string; 
	ssoProvider?: string; 
	ssoMetadata?: string; 
	ssoClientId?: string;
	ssoClientSecret?: string;
	ssoConfigured?: boolean;
	isIomEnabled?: boolean;
}) {
	const session = await getSession();
	if (!session || !session.user.org_slug) return { success: false, message: "Unauthorized" };
	
	const slug = session.user.org_slug as string;
	const actorId = session.user.id as string;

	return await tc(async () => {
		if (session.user.role !== "org_admin" && session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Organization Admins can update settings");
		}

		// SSO Validation
		if (data.ssoProvider && data.ssoProvider !== "none" && data.ssoMetadata) {
			try {
				let metadataUrl = data.ssoMetadata;
				
				// Auto-append OIDC discovery path if it looks like a base issuer URL
				if (data.ssoProvider !== "saml" && !metadataUrl.includes(".well-known")) {
					const baseUrl = metadataUrl.endsWith("/") ? metadataUrl : `${metadataUrl}/`;
					metadataUrl = `${baseUrl}.well-known/openid-configuration`;
				}

				const response = await axios.get(metadataUrl, { timeout: 8000 });
				const contentType = response.headers["content-type"];
				const body = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

				const isXml = body.includes("<?xml") || body.includes("<EntityDescriptor");
				const isJson = contentType?.includes("application/json") || (body.startsWith("{") && (body.includes("issuer") || body.includes("authorization_endpoint")));

				if (!isXml && !isJson) {
					throw new Error("Invalid metadata format. Expected SAML XML or OIDC JSON configuration.");
				}
				
				data.ssoConfigured = true;
				// If we successfully found the OIDC config at the discovery URL, save that URL
				data.ssoMetadata = data.ssoProvider !== "none" ? metadataUrl : data.ssoMetadata;

				// EXTRA: Validate M2M credentials if it's Auth0
				if (data.ssoProvider.toLowerCase() === "auth0" && data.ssoClientId && data.ssoClientSecret) {
					try {
						await getAuth0ManagementToken(data.ssoMetadata, data.ssoClientId, data.ssoClientSecret);
						console.log("🗝️ Auth0 M2M Handshake Successful for:", slug);
					} catch (e: any) {
						throw new Error(`Auth0 Credential Validation Failed: Your Client ID or Secret is incorrect.`);
					}
				}
			} catch (error: any) {
				const msg = error.response ? `Server responded with ${error.response.status}` : error.message;
				throw new Error(`SSO Verification Failed: ${msg}. Check your Metadata URL.`);
			}
		} else if (data.ssoProvider === "none") {
			data.ssoConfigured = false;
			data.ssoMetadata = "";
		}

		const [updatedOrg] = await db.update(organizations)
			.set({
				name: data.name,
				type: data.type,
				ssoProvider: data.ssoProvider,
				ssoMetadata: data.ssoMetadata,
				ssoClientId: data.ssoClientId,
				ssoClientSecret: data.ssoClientSecret,
				ssoConfigured: data.ssoConfigured,
				isIomEnabled: data.isIomEnabled,
			})
			.where(eq(organizations.slug, slug))
			.returning();

		if (!updatedOrg) throw new Error("Organization not found or update failed");

		// Audit Logging
		await db.insert(auditLogs).values({
			org_slug: slug,
			actor_id: actorId,
			action: "ORG_SETTINGS_UPDATED",
			entity_type: "organization",
			entity_id: updatedOrg.slug,
			metadata: { 
				...data, 
				ssoClientSecret: data.ssoClientSecret ? "[REDACTED]" : undefined 
			},
		} as any);

		revalidatePath("/dashboard/settings");
		return { success: true, org: updatedOrg };
	});
}

/**
 * Org Admin: Send a test invite to verify email deliverability (System Test Requirement)
 */
export async function actionSendTestInvite(email: string) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || !session.user.org_slug) {
			throw new ForbiddenError("Unauthorized");
		}

		const token = Math.random().toString(36).substring(2, 15);
		const expiry = new Date();
		expiry.setHours(expiry.getHours() + 24);

		await db.insert(invites).values({
			email,
			org_slug: session.user.org_slug,
			invited_by: session.user.id,
			token,
			expires_at: expiry,
			role: "member",
		});

		await db.insert(auditLogs).values({
			org_slug: session.user.org_slug,
			actor_id: session.user.id,
			action: "SYSTEM_TEST_INVITE",
			entity_type: "user",
			entity_id: email,
			metadata: { testEmail: email },
		});

		return { success: true, message: `Test invite sent to ${email}` };
	});
}

/**
 * Public: Check if an email domain belongs to an organization with SSO enabled.
 * Used for the dynamic login flow.
 */
export async function actionCheckSSO(email: string) {
	return await tc(async () => {
		if (!email || !email.includes("@")) return null;
		
		const domain = email.split("@")[1];
		if (!domain) return null;

		// Skip common personal domains
		console.log(`🔍 Checking SSO for domain: ${domain}`);

		const [org] = await db.select()
			.from(organizations)
			.where(sql`${domain} = ANY(${organizations.allowedDomains})`)
			.limit(1);

		if (org) {
			console.log(`✅ Found Org: ${org.name} (SSO Configured: ${org.ssoConfigured})`);
		} else {
			console.log(`❌ No organziation found for domain: ${domain}`);
		}

		if (org && org.ssoConfigured) {
			return {
				orgName: org.name,
				ssoProvider: org.ssoProvider || 'none',
				ssoConfigured: true,
				slug: org.slug,
			};
		}

		return null;
	});
}

/**
 * Get the OIDC/SAML authorization URL for the organization.
 */
export async function actionGetSSOUrl(email: string) {
	return await tc(async () => {
		if (!email || !email.includes("@")) throw new Error("Invalid email");
		
		const domain = email.split("@")[1];
		const [org] = await db.select()
			.from(organizations)
			.where(sql`${organizations.allowedDomains} @> array[${domain}]::text[]`)
			.limit(1);

		if (!org || !org.ssoConfigured || !org.ssoMetadata) {
			throw new Error("SSO is not enabled for this domain.");
		}

		// Auth0/OIDC standard params
		const issuer = org.ssoMetadata.endsWith("/") ? org.ssoMetadata : `${org.ssoMetadata}/`;
		const clientId = org.ssoClientId;
		
		if (!clientId) {
			throw new Error("Client ID is missing. Please configure it in Settings.");
		}

		const redirectUri = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/auth/sso/callback`;
		
		const params = new URLSearchParams({
			client_id: clientId,
			response_type: "code",
			scope: "openid profile email",
			redirect_uri: redirectUri,
			state: org.slug, // Pass slug to know where to redirect after callback
		});

		return { url: `${issuer}authorize?${params.toString()}` };
	});
}

/**
 * Exchange the SSO authorization code for a session.
 */
export async function actionExchangeSSOCode(code: string, slug: string) {
	return await tc(async () => {
		if (!code || !slug) throw new Error("Missing code or state");

		const [org] = await db.select()
			.from(organizations)
			.where(eq(organizations.slug, slug))
			.limit(1);

		if (!org || !org.ssoConfigured || !org.ssoMetadata || !org.ssoClientId || !org.ssoClientSecret) {
			throw new Error("Invalid organization SSO configuration");
		}

		const issuer = org.ssoMetadata.endsWith("/") ? org.ssoMetadata : `${org.ssoMetadata}/`;
		const tokenUrl = `${issuer}oauth/token`;
		const redirectUri = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/auth/sso/callback`;

		// 1. Exchange code for tokens
		const response = await axios.post(tokenUrl, {
			grant_type: "authorization_code",
			client_id: org.ssoClientId,
			client_secret: org.ssoClientSecret,
			code: code,
			redirect_uri: redirectUri,
		});

		const { id_token, access_token } = response.data;
		if (!id_token) throw new Error("Failed to obtain ID token from provider");

		// 2. Get User Info (In production, verify JWT, but for demo we'll fetch from /userinfo)
		const userInfoRes = await axios.get(`${issuer}userinfo`, {
			headers: { Authorization: `Bearer ${access_token}` }
		});

		const profile = userInfoRes.data;
		if (!profile.email) throw new Error("Email not provided by identity provider");

		// 3. Find or Create User
		const [existingUser] = await db.select().from(user).where(eq(user.email, profile.email)).limit(1);

		if (!existingUser) {
			// If user doesn't exist, we might want to auto-provision them if IOM is off
			// But for now, we'll assume they must exist or we fail (or create them as member)
			throw new Error(`Account not found for ${profile.email}. Please contact your administrator.`);
		}

		// 4. Provision a trusted session via Better Auth
		// We use the admin impersonateUser API to act as the verified user
		// and generate a valid session token/set cookies.
		const h = await headers();
		const headersObj = Object.fromEntries(h.entries());
		
		// Add the secret to bypass the admin check on the server
		headersObj["authorization"] = `Bearer ${process.env.BETTER_AUTH_SECRET}`;

		const loginResponse = await auth.api.impersonateUser({
			body: {
				userId: existingUser.id,
			},
			headers: headersObj,
		});

		if (!loginResponse) {
			throw new Error("Better Auth was unable to establish a session for the user.");
		}

		return { 
			success: true, 
			user: existingUser,
			message: `Welcome back, ${existingUser.name}!`
		};
	});
}

/**
 * Super Admin: Soft-delete a user
 */
export async function adminDeleteUser(id: string) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Super Admins can delete users");
		}
		if (session.user.id === id) {
			throw new Error("You cannot delete your own account");
		}
		const { softDeleteUser } = await import("@/db/query/user.query");
		await softDeleteUser(id);
		revalidatePath("/admin", "layout");
		return { success: true };
	});
}

/**
 * Super Admin: Delete an organization
 */
export async function adminDeleteOrganization(id: number) {
	return await tc(async () => {
		const session = await getSession();
		if (!session || session.user.role !== "super_admin") {
			throw new ForbiddenError("Only Super Admins can delete organizations");
		}
		const { deleteOrganization } = await import("@/db/query/organization.query");
		await deleteOrganization(id);
		revalidatePath("/admin", "layout");
		return { success: true };
	});
}
