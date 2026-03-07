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

if (process.env.NODE_ENV !== "production") {
	globalForDrizzle.db = db;
}

export type TxType = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Executes a callback within a transaction scoped to the given org schema.
 * SET LOCAL ensures the search_path resets automatically when the transaction ends.
 * The same connection is guaranteed for both the SET and all subsequent queries.
 */
async function withOrganization<T>(org_slug: string, callback: (tx: TxType) => Promise<T>) {
	return await db.transaction(async (tx) => {
		await tx.execute(sql`SET LOCAL search_path TO ${sql.identifier(org_slug)}, public`);
		return await callback(tx);
	});
}

export { db, withOrganization };
