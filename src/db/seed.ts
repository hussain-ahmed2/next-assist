import "dotenv/config";
import { db, withOrganization } from "@/db";
import { organizations, user, session, account, verification, site_config, courses, lessons, courseEnrollment, courseProgress } from "./schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

async function seed() {
	console.log("🔥 Purging database...");
	
	const purgeOrder = [
		{ name: "Progress", obj: courseProgress },
		{ name: "Enrollments", obj: courseEnrollment },
		{ name: "Lessons", obj: lessons },
		{ name: "Courses", obj: courses },
		{ name: "Sessions", obj: session },
		{ name: "Accounts", obj: account },
		{ name: "Verifications", obj: verification },
		{ name: "Users", obj: user },
		{ name: "Organizations", obj: organizations },
		{ name: "Site Config", obj: site_config },
	];

	for (const table of purgeOrder) {
		console.log(` - Purging ${table.name}`);
		try {
			await db.delete(table.obj);
		} catch (e) {
			console.log(` ⚠️ Skip ${table.name} (dependency or missing)`);
		}
	}

	console.log("🌱 Starting production-grade seed...\n");

	// 1. Platform Admin Org
	console.log("🏢 Creating Platform Root: NextAssist");
	await db.insert(organizations).values({
		name: "NextAssist",
		slug: "nextassist",
		plan: "Enterprise",
		type: "Company",
		isRoot: true,
	});

	// 2. Super Admin
	console.log("👑 Creating Super Admin: admin@nextassist.com");
	await auth.api.signUpEmail({
		body: {
			email: "admin@nextassist.com",
			password: "Admin@123456",
			name: "Super Admin",
		},
	});

	await db.update(user)
		.set({ 
			role: "super_admin", 
			org_slug: "nextassist",
			emailVerified: true 
		})
		.where(eq(user.email, "admin@nextassist.com"));

	// 3. Subsidiary Organizations
	const orgConfigs = [
		{ name: "Acme Corp", slug: "acme-inc", plan: "Enterprise", type: "Company" },
		{ name: "Globex Corporation", slug: "globex", plan: "Pro", type: "Company" },
		{ name: "Initech", slug: "initech", plan: "Free", type: "Company" },
		{ name: "Sprung Valley University", slug: "svu", plan: "University", type: "University" },
	];

	for (const org of orgConfigs) {
		console.log(`📦 Provisioning Org: ${org.name} (${org.slug})`);
		await db.insert(organizations).values(org);
		// Provision the physical schema
		await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(org.slug)}`);
		
		// Note: In real multi-tenant, you'd run migrations for each schema here.
		// For this seeder, we assume the search_path will fall back to public if tables aren't cloned.
	}

	// 4. Create specialized users
	const usersToCreate = [
		// Acme Inc
		{ email: "admin@acmeinc.com", password: "Password@123", name: "Acme Admin", role: "org_admin", org_slug: "acme-inc" },
		{ email: "specialist@acmeinc.com", password: "Password@123", name: "Acme Specialist", role: "expert", org_slug: "acme-inc" },
		{ email: "user1@acmeinc.com", password: "Password@123", name: "Acme User 1", role: "member", org_slug: "acme-inc" },
		{ email: "user3@acmeinc.com", password: "Password@123", name: "Acme User 3", role: "member", org_slug: "acme-inc" },
		
		// Globex
		{ email: "hank.scorpio@globex.com", password: "Password@123", name: "Hank Scorpio", role: "org_admin", org_slug: "globex" },
		{ email: "expert@globex.com", password: "Password@123", name: "Globex Expert", role: "expert", org_slug: "globex" },
		{ email: "user1@globex.com", password: "Password@123", name: "Globex Employee", role: "member", org_slug: "globex" },
		
		// Initech
		{ email: "bill.lumbergh@initech.com", password: "Password@123", name: "Bill Lumbergh", role: "org_admin", org_slug: "initech" },
		{ email: "milton@initech.com", password: "Password@123", name: "Milton Waddams", role: "member", org_slug: "initech" },
		
		// SVU
		{ email: "dean@svu.edu", password: "Password@123", name: "Dean Vernon", role: "org_admin", org_slug: "svu" },
		{ email: "professor@svu.edu", password: "Password@123", name: "Prof. Falken", role: "expert", org_slug: "svu" },
		{ email: "student@svu.edu", password: "Password@123", name: "David Lightman", role: "member", org_slug: "svu" },

		// Standalone / Guest
		{ email: "user2@acme.com", password: "Password@123", name: "Acme User 2", role: "user", org_slug: null },
		{ email: "guest@external.com", password: "Password@123", name: "External Guest", role: "user", org_slug: null },
	];

	for (const u of usersToCreate) {
		console.log(`👤 Creating ${u.role}: ${u.email}`);
		await auth.api.signUpEmail({
			body: {
				email: u.email,
				password: u.password,
				name: u.name,
			},
		});

		await db.update(user)
			.set({ 
				role: u.role as any, 
				org_slug: u.org_slug,
				emailVerified: true 
			})
			.where(eq(user.email, u.email));
	}

	// 5. Seed Tenant Data using withOrganization
	console.log("\n📚 Seeding Content & Progress (Per Tenant)...");

	// Acme Data
	await withOrganization("acme-inc", async () => {
		const [specialist] = await db.select().from(user).where(eq(user.email, "specialist@acmeinc.com")).limit(1);
		if (specialist) {
			const [course] = await db.insert(courses).values({
				title: "Advanced React Patterns",
				description: "Master high-level architecture in modern web apps.",
				creatorId: specialist.id,
				published: true,
			}).returning();

			await db.insert(lessons).values([
				{ courseId: course.id, title: "Compound Components", order: 1, content: "Mastering the compound component pattern." },
				{ courseId: course.id, title: "Render Props vs Hooks", order: 2, content: "Understanding the evolution of state sharing." },
			]);

			const [m1] = await db.select().from(user).where(eq(user.email, "user1@acmeinc.com")).limit(1);
			if (m1) {
				await db.insert(courseEnrollment).values({ courseId: course.id, memberId: m1.id });
				await db.insert(courseProgress).values({ courseId: course.id, memberId: m1.id, lessonsCompleted: 1 });
			}
		}
	});

	// Globex Data
	await withOrganization("globex", async () => {
		const [expert] = await db.select().from(user).where(eq(user.email, "expert@globex.com")).limit(1);
		if (expert) {
			const [course] = await db.insert(courses).values({
				title: "Cyber-Security Essentials",
				description: "Protecting corporate assets.",
				creatorId: expert.id,
				published: true,
			}).returning();

			await db.insert(lessons).values([
				{ courseId: course.id, title: "Network Security", order: 1, content: "Firewalls and VPNs." },
			]);

			const [m1] = await db.select().from(user).where(eq(user.email, "user1@globex.com")).limit(1);
			if (m1) {
				await db.insert(courseEnrollment).values({ courseId: course.id, memberId: m1.id });
				await db.insert(courseProgress).values({ courseId: course.id, memberId: m1.id, lessonsCompleted: 1 });
			}
		}
	});

	console.log("\n🎉 Multi-tenant seeding complete!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
