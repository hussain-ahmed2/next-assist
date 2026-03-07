import "server-only";
import { db } from "@/db";
import { user, session } from "../schema/auth";
import { eq, and, desc } from "drizzle-orm";

/**
 * Gets all users on the platform.
 */
export async function getAllUsers(orgSlug?: string) {
	const filters = [eq(user.deleted, false)];
	if (orgSlug) {
		filters.push(eq(user.org_slug, orgSlug));
	}
	return await db.select()
		.from(user)
		.where(and(...filters))
		.orderBy(desc(user.createdAt));
}

/**
 * Gets a single user by ID.
 */
export async function getUserById(userId: string) {
	const [u] = await db.select().from(user).where(eq(user.id, userId));
	return u;
}

/**
 * Updates a user's role and organization status.
 * Used by org_admins to 'accept' users into their organization.
 */
export async function updateMemberStatus(
	targetUserId: string, 
	orgSlug: string, 
	newRole: "member" | "expert" | "org_admin"
) {
	const [updatedUser] = await db.update(user)
		.set({ 
			role: newRole,
			org_slug: orgSlug,
			deleted: false // Ensure they aren't marked as deleted
		})
		.where(eq(user.id, targetUserId))
		.returning();
	
	return updatedUser;
}

/**
 * Gets all users who have requested to join an organization 
 * (or simply all users currently linked to an org)
 */
export async function getOrgMembers(orgSlug: string) {
	return await db.select()
		.from(user)
		.where(and(
			eq(user.org_slug, orgSlug),
			eq(user.deleted, false)
		));
}

/**
 * Soft deletes a user
 */
export async function softDeleteUser(userId: string) {
	return await db.update(user)
		.set({ 
			deleted: true,
			deletedAt: new Date()
		})
		.where(eq(user.id, userId))
		.returning();
}
/**
 * Updates a user's details.
 */
export async function updateUser(id: string, data: Partial<typeof user.$inferInsert>) {
	const [updated] = await db.update(user)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(user.id, id))
		.returning();
	return updated;
}

/**
 * Gets recent sessions for audit log (joined with user details).
 */
export async function getRecentSessions(limit = 100) {
	return await db
		.select({
			sessionId: session.id,
			createdAt: session.createdAt,
			expiresAt: session.expiresAt,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			userId: user.id,
			userName: user.name,
			userEmail: user.email,
			userRole: user.role,
			org_slug: user.org_slug,
		})
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(eq(user.deleted, false))
		.orderBy(desc(session.createdAt))
		.limit(limit);
}
