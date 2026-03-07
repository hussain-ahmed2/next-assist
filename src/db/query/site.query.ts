import "server-only";
import { db } from "@/db";
import { site_config } from "../schema/organizations";
import { eq } from "drizzle-orm";

export async function getSiteConfig() {
	let config = await db.query.site_config.findFirst();
	
	if (!config) {
		// Initialize if it doesn't exist
		[config] = await db.insert(site_config).values({}).returning();
	}
	
	return config;
}

export async function updateSiteConfig(data: Partial<typeof site_config.$inferInsert>) {
	const config = await getSiteConfig();
	
	const [updated] = await db.update(site_config)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(site_config.id, config.id))
		.returning();
		
	return updated;
}
