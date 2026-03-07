import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function reset() {
	const client = await pool.connect();
	try {
		console.log("💥 Dropping and recreating public schema...");
		await client.query("DROP SCHEMA public CASCADE;");
		await client.query("CREATE SCHEMA public;");
		console.log("✅ Schema wiped. Run db:push then db:seed to bring it back.");
	} finally {
		client.release();
		await pool.end();
	}
}

reset().catch((err) => {
	console.error("❌ Reset failed:", err.message);
	process.exit(1);
});
