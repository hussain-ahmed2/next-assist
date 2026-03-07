import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { db } from "./index";
import path from "path";

const TENANT_MIGRATIONS_DIR = path.join(process.cwd(), "drizzle/tenant");

/**
 * Provisions a new Postgres schema for a tenant org and runs all tenant
 * table migrations (courses, lessons, enrollment, progress) inside it.
 *
 * Call this whenever a Super Admin creates a new organization.
 *
 * @param slug - The org slug, e.g. "acme-inc". Becomes the Postgres schema name.
 */
export async function provisionTenantSchema(slug: string): Promise<void> {
	// 1. Create the Postgres schema (idempotent)
	await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(slug)}`);

	// 2. Use a dedicated client (not pool) so we can safely set search_path
	//    for the duration of the migration without affecting other connections.
	const client = new Client({ connectionString: process.env.DATABASE_URL! });
	await client.connect();

	try {
		// Set search_path so all CREATE TABLE statements land in the tenant schema.
		await client.query(`SET search_path TO "${slug}", public`);

		const tenantDb = drizzle({ client });

		// Run tenant migrations — creates courses, lessons, course_enrollment,
		// course_progress tables inside the tenant schema.
		// Each tenant schema gets its own __drizzle_migrations tracking table.
		await migrate(tenantDb, {
			migrationsFolder: TENANT_MIGRATIONS_DIR,
			migrationsSchema: slug,
			migrationsTable: `__drizzle_migrations_${slug.replace(/[^a-zA-Z0-9_]/g, "_")}`,
		});

		console.log(`✅ Provisioned schema: "${slug}"`);
	} finally {
		// Because DATABASE_URL likely points to a PgBouncer connection pool,
		// we MUST reset the search_path before releasing the connection back to the proxy.
		await client.query('RESET search_path').catch(() => {});
		await client.end();
	}
}
