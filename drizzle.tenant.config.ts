import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Separate config for tenant-scoped tables (courses, lessons, enrollment, progress).
// Run: npx drizzle-kit generate --config drizzle.tenant.config.ts
// This generates migrations in ./drizzle/tenant/ which are applied
// per-tenant schema at provisioning time via provisionTenantSchema().
export default defineConfig({
	out: "./drizzle/tenant",
	schema: "./src/db/schema/learning.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
