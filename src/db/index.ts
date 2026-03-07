import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

const globalForDrizzle = globalThis as unknown as {
	db: ReturnType<typeof drizzle>;
};

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

const db = globalForDrizzle.db || drizzle({ client: pool, logger: true, schema });

async function withOrganization<T>(org_slug: string, callback: () => Promise<T>) {
	// 1. Switch to tenant schema
	await db.execute(sql`SET search_path TO ${sql.identifier(org_slug)}, public`);

	// 2. Execute the callback (queries)
	try {
		return await callback();
	} finally {
		// 3. Reset to public (optional but good practice)
		await db.execute(sql`SET search_path TO public`);
	}
}

export { db, withOrganization };
