import "server-only";
import { tenantDb } from "../tenant-db";
import { courses, lessons, courseEnrollment, courseProgress } from "../schema/learning";
import { eq, not, asc, and, isNotNull, isNull } from "drizzle-orm";

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
			: db.select().from(courses).where(eq(courses.deleted, false));
		return await query;
	});
}

/**
 * Get detailed course for Super Admin (any course)
 */
export async function getSuperAdminCourseDetail(courseId: number) {
	return await tenantDb(async (db) => {
		const [course] = await db
			.select()
			.from(courses)
			.where(eq(courses.id, courseId));

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
 * Get course statistics (Super Admin only)
 */
export async function getSuperAdminCourseStats() {
	return await tenantDb(async (db) => {
		const active = await db.select().from(courses).where(eq(courses.deleted, false));
		const published = active.filter((c) => c.published);
		const draft = active.filter((c) => !c.published);

		return {
			total: active.length,
			published: published.length,
			draft: draft.length,
		};
	});
}

/**
 * Get total lesson count across platform (Super Admin only)
 */
export async function getSuperAdminAllLessonsCount() {
	return await tenantDb(async (db) => {
		const all_lessons = await db.select().from(lessons).where(eq(lessons.deleted, false));
		return all_lessons.length;
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
		return await db.select().from(courses).where(eq(courses.deleted, false)).orderBy(asc(courses.createdAt));
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
			.where(and(eq(courses.id, courseId), eq(courses.deleted, false)));

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
			.where(and(eq(courses.published, false), eq(courses.deleted, false)))
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
		return await db.select().from(courses).where(and(eq(courses.creatorId, creatorId), eq(courses.deleted, false)));
	});
}

/**
 * Get expert's published courses
 */
export async function getExpertPublishedCourses(creatorId: string) {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(courses)
			.where(and(eq(courses.creatorId, creatorId), eq(courses.published, true), eq(courses.deleted, false)));
	});
}

/**
 * Get expert's draft courses (works in progress)
 */
export async function getExpertDraftCourses(creatorId: string) {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(courses)
			.where(and(eq(courses.creatorId, creatorId), eq(courses.published, false), eq(courses.deleted, false)));
	});
}

/**
 * Get expert course with full lesson details
 */
export async function getExpertCourseWithLessons(courseId: number, creatorId: string) {
	return await tenantDb(async (db) => {
		const [course] = await db
			.select()
			.from(courses)
			.where(and(eq(courses.id, courseId), eq(courses.creatorId, creatorId)));

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
		const expert_courses = await db
			.select()
			.from(courses)
			.where(and(eq(courses.creatorId, creatorId), eq(courses.deleted, false)));
		let totalLessons = 0;

		for (const course of expert_courses) {
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
		return await db
			.select({
				id: courses.id,
				title: courses.title,
				description: courses.description,
				published: courses.published,
				createdAt: courses.createdAt,
			})
			.from(courseEnrollment)
			.innerJoin(courses, eq(courseEnrollment.courseId, courses.id))
			.where(eq(courseEnrollment.memberId, memberId));
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
		return await db.select().from(courses).where(eq(courses.deleted, false));
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

// ============================================================================
// COURSE ENROLLMENT QUERIES
// ============================================================================

/**
 * Enroll a member in a course
 */
export async function enrollMemberInCourse(courseId: number, memberId: string) {
	return await tenantDb(async (db) => {
		const [enrollment] = await db.insert(courseEnrollment).values({ courseId, memberId }).returning();
		return enrollment;
	});
}

/**
 * Check if member is enrolled in course
 */
export async function isMemberEnrolled(courseId: number, memberId: string) {
	return await tenantDb(async (db) => {
		const [enrollment] = await db
			.select()
			.from(courseEnrollment)
			.where(and(eq(courseEnrollment.courseId, courseId), eq(courseEnrollment.memberId, memberId)));
		return enrollment ? true : false;
	});
}

/**
 * Get member enrollments
 */
export async function getMemberEnrollments(memberId: string) {
	return await tenantDb(async (db) => {
		return await db.select().from(courseEnrollment).where(eq(courseEnrollment.memberId, memberId));
	});
}

/**
 * Get course enrollments (enrolled members)
 */
export async function getCourseEnrollments(courseId: number) {
	return await tenantDb(async (db) => {
		return await db.select().from(courseEnrollment).where(eq(courseEnrollment.courseId, courseId));
	});
}

/**
 * Get enrollment count for a course
 */
export async function getCourseEnrollmentCount(courseId: number) {
	return await tenantDb(async (db) => {
		const enrollments = await db.select().from(courseEnrollment).where(eq(courseEnrollment.courseId, courseId));
		return enrollments.length;
	});
}

/**
 * Remove member from course
 */
export async function removeMemberFromCourse(courseId: number, memberId: string) {
	return await tenantDb(async (db) => {
		return await db
			.delete(courseEnrollment)
			.where(and(eq(courseEnrollment.courseId, courseId), eq(courseEnrollment.memberId, memberId)))
			.returning();
	});
}

// ============================================================================
// COURSE PROGRESS QUERIES
// ============================================================================

/**
 * Create or get member's course progress
 */
export async function initializeOrGetCourseProgress(courseId: number, memberId: string) {
	return await tenantDb(async (db) => {
		const [existing] = await db
			.select()
			.from(courseProgress)
			.where(and(eq(courseProgress.courseId, courseId), eq(courseProgress.memberId, memberId)));

		if (existing) return existing;

		const [newProgress] = await db.insert(courseProgress).values({ courseId, memberId }).returning();

		return newProgress;
	});
}

/**
 * Get member's progress in a course
 */
export async function getMemberCourseProgressDetail(courseId: number, memberId: string) {
	return await tenantDb(async (db) => {
		const [progress] = await db
			.select()
			.from(courseProgress)
			.where(and(eq(courseProgress.courseId, courseId), eq(courseProgress.memberId, memberId)));

		if (!progress) return null;

		// Calculate total lessons in course
		const lessons_list = await db
			.select()
			.from(lessons)
			.where(and(eq(lessons.courseId, courseId), not(lessons.deleted)));

		return {
			...progress,
			totalLessons: lessons_list.length,
			progressPercentage:
				lessons_list.length > 0 ? Math.round((progress.lessonsCompleted / lessons_list.length) * 100) : 0,
		};
	});
}

/**
 * Update lesson completion count
 */
export async function updateCourseProgress(courseId: number, memberId: string, lessonsCompleted: number) {
	return await tenantDb(async (db) => {
		const [updated] = await db
			.update(courseProgress)
			.set({ lessonsCompleted })
			.where(and(eq(courseProgress.courseId, courseId), eq(courseProgress.memberId, memberId)))
			.returning();

		return updated;
	});
}

/**
 * Mark course as completed by member
 */
export async function markCourseCompleted(courseId: number, memberId: string) {
	return await tenantDb(async (db) => {
		const [updated] = await db
			.update(courseProgress)
			.set({ completedAt: new Date() })
			.where(and(eq(courseProgress.courseId, courseId), eq(courseProgress.memberId, memberId)))
			.returning();

		return updated;
	});
}

/**
 * Get all courses completed by member
 */
export async function getMemberCompletedCourses(memberId: string) {
	return await tenantDb(async (db) => {
		return await db
			.select()
			.from(courseProgress)
			.where(and(eq(courseProgress.memberId, memberId), isNotNull(courseProgress.completedAt)));
	});
}

/**
 * Get member's in-progress courses
 */
export async function getMemberInProgressCourses(memberId: string) {
	return await tenantDb(async (db) => {
		const inProgress = await db
			.select({
				id: courseProgress.id,
				courseId: courseProgress.courseId,
				lessonsCompleted: courseProgress.lessonsCompleted,
				title: courses.title,
				description: courses.description,
			})
			.from(courseProgress)
			.innerJoin(courses, eq(courseProgress.courseId, courses.id))
			.where(and(eq(courseProgress.memberId, memberId), isNull(courseProgress.completedAt)));

		// For each course, get total lessons count
		const results = [];
		for (const item of inProgress) {
			const lessons_list = await db
				.select()
				.from(lessons)
				.where(and(eq(lessons.courseId, item.courseId), not(lessons.deleted)));

			results.push({
				...item,
				totalLessons: lessons_list.length,
				progressPercentage:
					lessons_list.length > 0 ? Math.round((item.lessonsCompleted / lessons_list.length) * 100) : 0,
			});
		}

		return results;
	});
}

/**
 * Get course completion stats
 */
export async function getCourseCompletionStats(courseId: number) {
	return await tenantDb(async (db) => {
		const allProgress = await db.select().from(courseProgress).where(eq(courseProgress.courseId, courseId));

		const completed = allProgress.filter((p) => p.completedAt !== null);

		return {
			totalEnrolled: allProgress.length,
			totalCompleted: completed.length,
			completionRate: allProgress.length > 0 ? Math.round((completed.length / allProgress.length) * 100) : 0,
			averageLessonsCompleted:
				allProgress.length > 0
					? Math.round(allProgress.reduce((sum, p) => sum + p.lessonsCompleted, 0) / allProgress.length)
					: 0,
		};
	});
}
