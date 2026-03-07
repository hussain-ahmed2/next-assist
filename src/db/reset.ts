import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function reset() {
	const client = await pool.connect();
	try {
		console.log("💥 Dropping all tenant schemas...");

		// Find all non-system, non-public schemas (these are tenant schemas we created)
		const { rows } = await client.query(`
			SELECT schema_name
			FROM information_schema.schemata
			WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
			  AND schema_name NOT LIKE 'pg_%'
		`);

		for (const row of rows) {
			console.log(` - Dropping tenant schema: ${row.schema_name}`);
			await client.query(`DROP SCHEMA IF EXISTS "${row.schema_name}" CASCADE`);
		}

		console.log("💥 Dropping all tables and enums in public schema...");
		await client.query("CREATE SCHEMA IF NOT EXISTS public;");
		// Drop all tables in public schema
		const { rows: tableRows } = await client.query(`
			SELECT tablename 
			FROM pg_tables 
			WHERE schemaname = 'public'
		`);
		for (const row of tableRows) {
			await client.query(`DROP TABLE IF EXISTS "public"."${row.tablename}" CASCADE`);
		}

		// Drop all custom types (enums) in public schema
		const { rows: typeRows } = await client.query(`
			SELECT typname 
			FROM pg_type t 
			JOIN pg_namespace n ON n.oid = t.typnamespace 
			WHERE n.nspname = 'public' AND t.typtype = 'e'
		`);
		for (const row of typeRows) {
			await client.query(`DROP TYPE IF EXISTS "public"."${row.typname}" CASCADE`);
		}

		console.log("✅ All schemas wiped. Run db:push then db:seed to bring it back.");
	} finally {
		client.release();
		await pool.end();
	}
}

reset().catch((err) => {
	console.error("❌ Reset failed:", err.message);
	process.exit(1);
});
