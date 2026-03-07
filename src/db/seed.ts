import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { organizations, user, session, account, verification, site_config, courses, lessons, courseEnrollment, courseProgress } from "./schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle({ client: pool, schema });

async function seed() {
	console.log("🔥 Purging database...");
	
	await db.delete(courseProgress);
	await db.delete(courseEnrollment);
	await db.delete(lessons);
	await db.delete(courses);
	await db.delete(session);
	await db.delete(account);
	await db.delete(user);
	await db.delete(organizations);
	await db.delete(site_config);
	await db.delete(verification);

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
	const orgs = [
		{ name: "Acme Corp", slug: "acme-inc", plan: "Enterprise", type: "Company" },
		{ name: "Globex Corporation", slug: "globex", plan: "Pro", type: "Company" },
		{ name: "Initech", slug: "initech", plan: "Free", type: "Company" },
		{ name: "Sprung Valley University", slug: "svu", plan: "University", type: "University" },
	];

	for (const org of orgs) {
		console.log(`📦 Provisioning Org: ${org.name} (${org.slug})`);
		await db.insert(organizations).values(org);
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

	// 5. Create some Content for Experts
	console.log("\n📚 Seeding Knowledge Catalog...");

	// Get Acme Specialist ID
	const [acmeSpecialist] = await db.select().from(user).where(eq(user.email, "specialist@acmeinc.com")).limit(1);
	if (acmeSpecialist) {
		const [course1] = await db.insert(courses).values({
			title: "Advanced React Patterns",
			description: "Master high-level architecture in modern web apps.",
			creatorId: acmeSpecialist.id,
			published: true,
		}).returning();

		await db.insert(lessons).values([
			{ courseId: course1.id, title: "Compound Components", order: 1, content: "Mastering the compound component pattern." },
			{ courseId: course1.id, title: "Render Props vs Hooks", order: 2, content: "Understanding the evolution of state sharing." },
			{ courseId: course1.id, title: "Performance Optimization", order: 3, content: "Memoization and reconciliation deep dive." },
		]);

		const [course2] = await db.insert(courses).values({
			title: "Drizzle ORM & Postgres",
			description: "Typesafe database management for Next.js.",
			creatorId: acmeSpecialist.id,
			published: false,
		}).returning();

		await db.insert(lessons).values([
			{ courseId: course2.id, title: "Schema Definition", order: 1, content: "Defining tables and relations." },
		]);
	}

	// Get Globex Expert ID
	const [globexExpert] = await db.select().from(user).where(eq(user.email, "expert@globex.com")).limit(1);
	if (globexExpert) {
		const [course] = await db.insert(courses).values({
			title: "Cyber-Security Essentials",
			description: "Protecting corporate assets in the digital age.",
			creatorId: globexExpert.id,
			published: true,
		}).returning();

		await db.insert(lessons).values([
			{ courseId: course.id, title: "Network Security", order: 1, content: "Firewalls and VPNs." },
			{ courseId: course.id, title: "Phishing Prevention", order: 2, content: "Social engineering awareness." },
		]);
	}

	// 6. Seed Progress for Members
	console.log("📈 Seeding Member Progress...");
	
	const [acmeUser1] = await db.select().from(user).where(eq(user.email, "user1@acmeinc.com")).limit(1);
	const [reactCourse] = await db.select().from(courses).where(eq(courses.title, "Advanced React Patterns")).limit(1);
	
	if (acmeUser1 && reactCourse) {
		await db.insert(courseEnrollment).values({
			courseId: reactCourse.id,
			memberId: acmeUser1.id,
		});

		await db.insert(courseProgress).values({
			courseId: reactCourse.id,
			memberId: acmeUser1.id,
			lessonsCompleted: 1,
		});
	}

	const [globexEmployee] = await db.select().from(user).where(eq(user.email, "user1@globex.com")).limit(1);
	const [securityCourse] = await db.select().from(courses).where(eq(courses.title, "Cyber-Security Essentials")).limit(1);

	if (globexEmployee && securityCourse) {
		await db.insert(courseEnrollment).values({
			courseId: securityCourse.id,
			memberId: globexEmployee.id,
		});

		await db.insert(courseProgress).values({
			courseId: securityCourse.id,
			memberId: globexEmployee.id,
			lessonsCompleted: 2,
			completedAt: new Date(),
		});
	}

	console.log("\n🎉 High-density seeding complete!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
