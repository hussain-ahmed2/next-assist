import "server-only";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { organizations } from "../schema/organizations";
import { user } from "../schema/auth";
import { eq, desc } from "drizzle-orm";

/**
 * Gets all organizations on the platform.
 */
export async function getAllOrganizations(slug?: string) {
	let query = db.select().from(organizations);
	if (slug) {
		query = db.select().from(organizations).where(eq(organizations.slug, slug)) as any;
	}
	return await query.orderBy(desc(organizations.createdAt));
}

/**
 * Creates a new organization and provisions its dedicated database schema.
 */
export async function createOrganizationWithSchema(name: string, slug: string, adminUserId: string, plan: string = "Free") {
	return await db.transaction(async (tx) => {
		// 1. Create the organization record in public schema
		const [org] = await tx.insert(organizations).values({
			name,
			slug,
			plan,
		}).returning();

		// 2. Create the physical postgres schema
		// Note: Using sql.identifier for safety against SQL injection on identifiers
		await tx.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(slug)}`);

		// 3. Link the admin user to this organization and set their role
		await tx.update(user)
			.set({ 
				org_slug: slug, 
				role: "org_admin" 
			})
			.where(eq(user.id, adminUserId));

		// 4. (Optional) Run migrations for the new schema
		// In a production app, you might trigger a worker or use a specialized migration tool here.
		// For now, we'll assume the tables exist or will be pushed via drizzle-kit.

		return org;
	});
}
/**
 * Updates an organization's details.
 */
export async function updateOrganization(id: number, data: Partial<typeof organizations.$inferInsert>) {
	const [updated] = await db.update(organizations)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(organizations.id, id))
		.returning();
	return updated;
}

/**
 * Deletes an organization and disassociates all its users.
 */
export async function deleteOrganization(id: number) {
	return await db.transaction(async (tx) => {
		// Find the org first to get slug
		const [org] = await tx.select().from(organizations).where(eq(organizations.id, id));
		if (!org) throw new Error("Organization not found");

		// Disassociate all users from this org (set org_slug to null, downgrade role to 'user')
		await tx.update(user)
			.set({ org_slug: null, role: "user" })
			.where(eq(user.org_slug, org.slug));

		// Delete the organization record
		await tx.delete(organizations).where(eq(organizations.id, id));

		return { success: true, slug: org.slug };
	});
}
