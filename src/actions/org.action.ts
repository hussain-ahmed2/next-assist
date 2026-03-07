'use server';

import { getOrgMembers, updateMemberStatus, getAllUsers } from "@/db/query/user.query";
import { getAllOrganizations, createOrganizationWithSchema } from "@/db/query/organization.query";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { tc } from "@/lib/async";
import { ForbiddenError } from "@/lib/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateUserSchema } from "@/validations/admin.validation";

/**
 * Action for Org Admins to accept a user into their organization
 */
export async function acceptUserToOrg(targetUserId: string, role: "member" | "expert" = "member") {
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
		const org = await updateOrganization(id, data);
		
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
