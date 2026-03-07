import "server-only";
import { db } from "@/db";
import { provisionTenantSchema } from "@/db/provision";
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

export async function getOrganizationBySlug(slug: string) {
	const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
	return org || null;
}

/**
 * Creates a new organization and provisions its dedicated database schema.
 */
export async function createOrganizationWithSchema(name: string, slug: string, adminUserId: string, plan: string = "Free") {
	// 1. Insert org record + link admin user in a transaction
	const [org] = await db.transaction(async (tx) => {
		const [org] = await tx.insert(organizations).values({ name, slug, plan }).returning();

		await tx.update(user)
			.set({ org_slug: slug, role: "org_admin" })
			.where(eq(user.id, adminUserId));

		return [org];
	});

	// 2. Provision the Postgres schema + run tenant migrations (courses, lessons, etc.)
	// Done outside the transaction — migrate() needs its own dedicated connection.
	await provisionTenantSchema(slug);

	return org;
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
