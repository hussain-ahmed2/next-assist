import "server-only";
import { tenantDb } from "../tenant-db";
import { courses, lessons } from "../schema/learning";
import { eq, not, asc, and } from "drizzle-orm";

// ============================================================================
// SUPER ADMIN QUERIES - Full system access to all courses
// ============================================================================

/**
 * Get all courses across the system (Super Admin only)
 * Includes deleted courses for audit purposes
 */
export async function getSuperAdminAllCourses(includeDeleted: boolean = false) {
	return await tenantDb(async (db) => {
		const query = includeDeleted
			? db.select().from(courses)
			: db.select().from(courses).where(not(courses.deleted));
		return await query;
	});
}

/**
 * Get course statistics (Super Admin only)
 */
export async function getSuperAdminCourseStats() {
	return await tenantDb(async (db) => {
		const active = await db.select().from(courses).where(not(courses.deleted));
		const published = active.filter((c) => c.published);
		const draft = active.filter((c) => !c.published);

		return {
			total: active.length,
			published: published.length,
			draft: draft.length,
		};
	});
}

// ============================================================================
// ORG ADMIN QUERIES - Organization-level course management
// ============================================================================

/**
 * Get all courses for an organization (Org Admin)
 * Based on tenant database context
 */
export async function getOrgAdminCourses() {
	return await tenantDb(async (db) => {
		return await db.select().from(courses).where(not(courses.deleted)).orderBy(asc(courses.createdAt));
	});
}

/**
 * Get detailed course with lesson count (Org Admin)
 */
export async function getOrgAdminCourseDetail(courseId: number) {
	return await tenantDb(async (db) => {
		const [course] = await db
			.select()
			.from(courses)
			.where(and(eq(courses.id, courseId), not(courses.deleted)));

		if (!course) return null;

		const courseLessons = await db
			.select()
			.from(lessons)
			.where(and(eq(lessons.courseId, courseId), not(lessons.deleted)));

		return {
			...course,
			lessonCount: courseLessons.length,
			lessons: courseLessons,
		};
	});
}

/**
 * Get published courses count for Org Admin dashboard
 */
export async function getOrgAdminPublishedCoursesCount() {
	return await tenantDb(async (db) => {
		const published = await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, true), not(courses.deleted)));
		return published.length;
	});
}

/**
 * Get draft courses for Org Admin
 */
export async function getOrgAdminDraftCourses() {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, false), not(courses.deleted)))
			.orderBy(asc(courses.updatedAt));
	});
}

// ============================================================================
// EXPERT QUERIES - Instructor/content creator management
// ============================================================================

/**
 * Get all courses created by an expert
 * Filter by creatorId when schema is updated
 */
export async function getExpertCourses(creatorId: string) {
	return await tenantDb(async (db) => {
		// TODO: Filter by creatorId once schema includes it
		const allCourses = await db.select().from(courses).where(not(courses.deleted));
		return allCourses; // Placeholder - update when creatorId field exists
	});
}

/**
 * Get expert's published courses
 */
export async function getExpertPublishedCourses(creatorId: string) {
	return await tenantDb(async (db) => {
		const published = await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, true), not(courses.deleted)));
		return published; // Placeholder - filter by creatorId once available
	});
}

/**
 * Get expert's draft courses (works in progress)
 */
export async function getExpertDraftCourses(creatorId: string) {
	return await tenantDb(async (db) => {
		const drafts = await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, false), not(courses.deleted)));
		return drafts; // Placeholder - filter by creatorId once available
	});
}

/**
 * Get expert course with full lesson details
 */
export async function getExpertCourseWithLessons(courseId: number, creatorId: string) {
	return await tenantDb(async (db) => {
		const [course] = await db.select().from(courses).where(eq(courses.id, courseId));

		if (!course) return null;

		const courseLessons = await db
			.select()
			.from(lessons)
			.where(eq(lessons.courseId, courseId))
			.orderBy(asc(lessons.order));

		return {
			...course,
			lessons: courseLessons,
		};
	});
}

/**
 * Get lesson count for expert dashboard
 */
export async function getExpertTotalLessonsCount(creatorId: string) {
	return await tenantDb(async (db) => {
		const courses_list = await db.select().from(courses).where(not(courses.deleted));
		let totalLessons = 0;

		for (const course of courses_list) {
			const courseLessons = await db
				.select()
				.from(lessons)
				.where(and(eq(lessons.courseId, course.id), not(lessons.deleted)));
			totalLessons += courseLessons.length;
		}

		return totalLessons;
	});
}

// ============================================================================
// MEMBER QUERIES - Student/learner access
// ============================================================================

/**
 * Get publicly available courses for members
 * Only published courses
 */
export async function getMemberAvailableCourses() {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, true), not(courses.deleted)))
			.orderBy(asc(courses.createdAt));
	});
}

/**
 * Get courses enrolled by a member
 * TODO: Implement when courseEnrollment table is added
 */
export async function getMemberEnrolledCourses(memberId: string) {
	return await tenantDb(async (db) => {
		// TODO: Query courseEnrollment table where memberId = memberId
		const published = await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, true), not(courses.deleted)));
		return published;
	});
}

/**
 * Get specific course for member to learn
 */
export async function getMemberCourseDetail(courseId: number) {
	return await tenantDb(async (db) => {
		const [course] = await db
			.select()
			.from(courses)
			.where(and(eq(courses.id, courseId), eq(courses.published, true), not(courses.deleted)));

		if (!course) return null;

		const courseLessons = await db
			.select()
			.from(lessons)
			.where(and(eq(lessons.courseId, courseId), not(lessons.deleted)))
			.orderBy(asc(lessons.order));

		return {
			...course,
			lessons: courseLessons,
		};
	});
}

/**
 * Get specific lesson content for member
 */
export async function getMemberLesson(lessonId: number) {
	return await tenantDb(async (db) => {
		const [lesson] = await db
			.select()
			.from(lessons)
			.where(and(eq(lessons.id, lessonId), not(lessons.deleted)));
		return lesson || null;
	});
}

/**
 * Get member's learning progress
 * TODO: Implement when courseProgress table is added
 */
export async function getMemberCourseProgress(memberId: string, courseId: number) {
	return await tenantDb(async (db) => {
		// TODO: Query courseProgress table
		return {
			memberId,
			courseId,
			lessonsCompleted: 0,
			totalLessons: 0,
			progressPercentage: 0,
		};
	});
}

// ============================================================================
// USER QUERIES - Pending/base user access
// ============================================================================

/**
 * Get public courses available to regular users
 * Only published courses that don't require enrollment
 */
export async function getUserPublicCourses() {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, true), not(courses.deleted)))
			.orderBy(asc(courses.title));
	});
}

/**
 * Get featured/popular courses for user discovery
 */
export async function getUserFeaturedCourses(limit: number = 6) {
	return await tenantDb(async (db) => {
		const published = await db
			.select()
			.from(courses)
			.where(and(eq(courses.published, true), not(courses.deleted)))
			.orderBy(asc(courses.createdAt));

		return published.slice(0, limit);
	});
}

// ============================================================================
// SHARED/COMMON QUERIES - Used across all roles
// ============================================================================

export async function getCourses() {
	return await tenantDb(async (db) => {
		return await db.select().from(courses).where(not(courses.deleted));
	});
}

export async function getCourseById(id: number) {
	return await tenantDb(async (db) => {
		const [course] = await db.select().from(courses).where(eq(courses.id, id));
		return course || null;
	});
}

export async function createCourse(data: typeof courses.$inferInsert) {
	return await tenantDb(async (db) => {
		const [course] = await db.insert(courses).values(data).returning();
		return course;
	});
}

export async function updateCourse(id: number, data: Partial<typeof courses.$inferInsert>) {
	return await tenantDb(async (db) => {
		const [course] = await db.update(courses).set(data).where(eq(courses.id, id)).returning();
		return course;
	});
}

export async function publishCourse(id: number) {
	return await tenantDb(async (db) => {
		const [course] = await db.update(courses).set({ published: true }).where(eq(courses.id, id)).returning();
		return course;
	});
}

export async function unpublishCourse(id: number) {
	return await tenantDb(async (db) => {
		const [course] = await db.update(courses).set({ published: false }).where(eq(courses.id, id)).returning();
		return course;
	});
}

export async function softDeleteCourse(id: number) {
	return await tenantDb(async (db) => {
		return await db.update(courses).set({ deleted: true }).where(eq(courses.id, id)).returning();
	});
}

// ============================================================================
// LESSON QUERIES - Used across all roles
// ============================================================================

export async function getLessons(courseId: number) {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(lessons)
			.where(and(eq(lessons.courseId, courseId), not(lessons.deleted)))
			.orderBy(asc(lessons.order));
	});
}

export async function getLesson(lessonId: number) {
	return await tenantDb(async (db) => {
		const [lesson] = await db
			.select()
			.from(lessons)
			.where(and(eq(lessons.id, lessonId), not(lessons.deleted)));
		return lesson || null;
	});
}

export async function createLesson(data: typeof lessons.$inferInsert) {
	return await tenantDb(async (db) => {
		const [lesson] = await db.insert(lessons).values(data).returning();
		return lesson;
	});
}

export async function updateLesson(id: number, data: Partial<typeof lessons.$inferInsert>) {
	return await tenantDb(async (db) => {
		const [lesson] = await db.update(lessons).set(data).where(eq(lessons.id, id)).returning();
		return lesson;
	});
}

export async function reorderLessons(courseId: number, lessonOrder: { id: number; order: number }[]) {
	return await tenantDb(async (db) => {
		const results = [];
		for (const { id, order } of lessonOrder) {
			const [updated] = await db.update(lessons).set({ order }).where(eq(lessons.id, id)).returning();
			results.push(updated);
		}
		return results;
	});
}

export async function softDeleteLesson(id: number) {
	return await tenantDb(async (db) => {
		return await db.update(lessons).set({ deleted: true }).where(eq(lessons.id, id)).returning();
	});
}
