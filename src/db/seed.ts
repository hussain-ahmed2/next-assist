import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { organizations, user } from "./schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle({ client: pool, schema });

const SUPER_ADMIN = {
	name: "Super Admin",
	email: "admin@nextassist.com",
	password: "Admin@123456",
};

const SYSTEM_ORG = {
	name: "NextAssist",
	slug: "nextassist",
};

async function seed() {
	console.log("🌱 Seeding database...\n");

	// 1. Upsert the system org
	const [existingOrg] = await db
		.select()
		.from(organizations)
		.where(eq(organizations.slug, SYSTEM_ORG.slug))
		.limit(1);

	if (!existingOrg) {
		console.log(`📦 Creating org: ${SYSTEM_ORG.name} (${SYSTEM_ORG.slug})`);
		await db.insert(organizations).values(SYSTEM_ORG);
	} else {
		console.log(`✅ Org already exists: ${SYSTEM_ORG.slug}`);
	}

	// 2. Upsert the super admin
	const [existingUser] = await db
		.select()
		.from(user)
		.where(eq(user.email, SUPER_ADMIN.email))
		.limit(1);

	if (existingUser) {
		console.log(`✅ Super admin already exists: ${SUPER_ADMIN.email}`);
	} else {
		console.log(`👤 Creating super admin: ${SUPER_ADMIN.email}`);

		// Use Better Auth's own API so password is hashed in the correct format
		await auth.api.signUpEmail({
			body: {
				email: SUPER_ADMIN.email,
				password: SUPER_ADMIN.password,
				name: SUPER_ADMIN.name,
				org_slug: SYSTEM_ORG.slug,
				role: "super_admin",
			},
		});

		// Elevate to super_admin (signUpEmail sets role from body but let's ensure)
		await db
			.update(user)
			.set({ role: "super_admin", emailVerified: true })
			.where(eq(user.email, SUPER_ADMIN.email));

		console.log(`\n✅ Super admin created!`);
		console.log(`   Email   : ${SUPER_ADMIN.email}`);
		console.log(`   Password: ${SUPER_ADMIN.password}`);
		console.log(`   Role    : super_admin`);
	}

	console.log("\n🎉 Seeding complete!");
	await pool.end();
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
