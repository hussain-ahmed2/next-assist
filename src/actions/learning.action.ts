"use server";

import {
	// Super Admin Queries
	getSuperAdminAllCourses,
	getSuperAdminCourseStats,
	// Org Admin Queries
	getOrgAdminCourses,
	getOrgAdminCourseDetail,
	getOrgAdminPublishedCoursesCount,
	getOrgAdminDraftCourses,
	// Expert Queries
	getExpertCourses,
	getExpertPublishedCourses,
	getExpertDraftCourses,
	getExpertCourseWithLessons,
	getExpertTotalLessonsCount,
	// Member Queries
	getMemberAvailableCourses,
	getMemberEnrolledCourses,
	getMemberCourseDetail,
	getMemberLesson,
	getMemberCourseProgress,
	// User Queries
	getUserPublicCourses,
	getUserFeaturedCourses,
	// Common Queries
	getCourses,
	getCourseById,
	createCourse,
	updateCourse,
	publishCourse,
	unpublishCourse,
	softDeleteCourse,
	getLessons,
	getLesson,
	createLesson,
	updateLesson,
	reorderLessons,
	softDeleteLesson,
} from "@/db/query/learning.query";
import { tc } from "@/lib/async";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ForbiddenError } from "@/lib/errors";

// ============================================================================
// SUPER ADMIN ACTIONS
// ============================================================================

/**
 * Super Admin: Get all courses across the system
 */
export async function superAdminGetAllCourses(includeDeleted: boolean = false) {
	const session = await getSession();
	if (!session || session.user.role !== "super_admin") {
		throw new ForbiddenError("Only super admins can access all courses");
	}

	return await tc(async () => await getSuperAdminAllCourses(includeDeleted));
}

/**
 * Super Admin: Get course statistics
 */
export async function superAdminGetCourseStats() {
	const session = await getSession();
	if (!session || session.user.role !== "super_admin") {
		throw new ForbiddenError("Only super admins can view statistics");
	}

	return await tc(async () => await getSuperAdminCourseStats());
}

// ============================================================================
// ORG ADMIN ACTIONS
// ============================================================================

/**
 * Org Admin: Get all courses in their organization
 */
export async function orgAdminGetCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can access this");
	}

	return await tc(async () => await getOrgAdminCourses());
}

/**
 * Org Admin: Get course detail with lessons
 */
export async function orgAdminGetCourseDetail(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can access this");
	}

	return await tc(async () => await getOrgAdminCourseDetail(courseId));
}

/**
 * Org Admin: Get published courses count
 */
export async function orgAdminGetPublishedCount() {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can access this");
	}

	return await tc(async () => await getOrgAdminPublishedCoursesCount());
}

/**
 * Org Admin: Get draft courses
 */
export async function orgAdminGetDraftCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can access this");
	}

	return await tc(async () => await getOrgAdminDraftCourses());
}

/**
 * Org Admin: Create new course
 */
export async function orgAdminCreateCourse(title: string, description: string) {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can create courses");
	}

	const result = await tc(async () => await createCourse({ title, description, published: false }));

	if (result.success) {
		revalidatePath("/dashboard/courses");
	}

	return result;
}

/**
 * Org Admin: Update course
 */
export async function orgAdminUpdateCourse(courseId: number, title: string, description: string) {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can update courses");
	}

	const result = await tc(async () => await updateCourse(courseId, { title, description }));

	if (result.success) {
		revalidatePath("/dashboard/courses");
	}

	return result;
}

/**
 * Org Admin: Publish course
 */
export async function orgAdminPublishCourse(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can publish courses");
	}

	const result = await tc(async () => await publishCourse(courseId));

	if (result.success) {
		revalidatePath("/dashboard/courses");
	}

	return result;
}

/**
 * Org Admin: Unpublish course
 */
export async function orgAdminUnpublishCourse(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can unpublish courses");
	}

	const result = await tc(async () => await unpublishCourse(courseId));

	if (result.success) {
		revalidatePath("/dashboard/courses");
	}

	return result;
}

/**
 * Org Admin: Delete course (soft delete)
 */
export async function orgAdminDeleteCourse(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "org_admin") {
		throw new ForbiddenError("Only org admins can delete courses");
	}

	const result = await tc(async () => await softDeleteCourse(courseId));

	if (result.success) {
		revalidatePath("/dashboard/courses");
	}

	return result;
}

// ============================================================================
// EXPERT ACTIONS
// ============================================================================

/**
 * Expert: Get their own courses
 */
export async function expertGetMyCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can access this");
	}

	return await tc(async () => await getExpertCourses(session.user.id || ""));
}

/**
 * Expert: Get published courses
 */
export async function expertGetPublishedCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can access this");
	}

	return await tc(async () => await getExpertPublishedCourses(session.user.id || ""));
}

/**
 * Expert: Get draft courses
 */
export async function expertGetDraftCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can access this");
	}

	return await tc(async () => await getExpertDraftCourses(session.user.id || ""));
}

/**
 * Expert: Get course with lessons
 */
export async function expertGetCourseWithLessons(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can access this");
	}

	return await tc(async () => await getExpertCourseWithLessons(courseId, session.user.id || ""));
}

/**
 * Expert: Get total lessons count
 */
export async function expertGetTotalLessonsCount() {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can access this");
	}

	return await tc(async () => await getExpertTotalLessonsCount(session.user.id || ""));
}

/**
 * Expert: Create new course
 */
export async function expertCreateCourse(title: string, description: string) {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can create courses");
	}

	const result = await tc(async () => await createCourse({ title, description, published: false }));

	if (result.success) {
		revalidatePath("/workspace");
	}

	return result;
}

/**
 * Expert: Update course
 */
export async function expertUpdateCourse(courseId: number, title: string, description: string) {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can update courses");
	}

	const result = await tc(async () => await updateCourse(courseId, { title, description }));

	if (result.success) {
		revalidatePath("/workspace");
	}

	return result;
}

/**
 * Expert: Publish course
 */
export async function expertPublishCourse(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can publish courses");
	}

	const result = await tc(async () => await publishCourse(courseId));

	if (result.success) {
		revalidatePath("/workspace");
	}

	return result;
}

/**
 * Expert: Delete course (soft delete)
 */
export async function expertDeleteCourse(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "expert") {
		throw new ForbiddenError("Only experts can delete courses");
	}

	const result = await tc(async () => await softDeleteCourse(courseId));

	if (result.success) {
		revalidatePath("/workspace");
	}

	return result;
}

// ============================================================================
// MEMBER ACTIONS
// ============================================================================

/**
 * Member: Get available courses to enroll
 */
export async function memberGetAvailableCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "member") {
		throw new ForbiddenError("Only members can access this");
	}

	return await tc(async () => await getMemberAvailableCourses());
}

/**
 * Member: Get enrolled courses
 */
export async function memberGetEnrolledCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "member") {
		throw new ForbiddenError("Only members can access this");
	}

	return await tc(async () => await getMemberEnrolledCourses(session.user.id || ""));
}

/**
 * Member: Get course detail to learn
 */
export async function memberGetCourseDetail(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "member") {
		throw new ForbiddenError("Only members can access this");
	}

	return await tc(async () => await getMemberCourseDetail(courseId));
}

/**
 * Member: Get lesson content
 */
export async function memberGetLesson(lessonId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "member") {
		throw new ForbiddenError("Only members can access lessons");
	}

	return await tc(async () => await getMemberLesson(lessonId));
}

/**
 * Member: Get course progress
 */
export async function memberGetCourseProgress(courseId: number) {
	const session = await getSession();
	if (!session || session.user.role !== "member") {
		throw new ForbiddenError("Only members can access this");
	}

	return await tc(async () => await getMemberCourseProgress(session.user.id || "", courseId));
}

// ============================================================================
// USER ACTIONS
// ============================================================================

/**
 * User: Get public courses
 */
export async function userGetPublicCourses() {
	const session = await getSession();
	if (!session || session.user.role !== "user") {
		throw new ForbiddenError("Only pending users can access this");
	}

	return await tc(async () => await getUserPublicCourses());
}

/**
 * User: Get featured courses for discovery
 */
export async function userGetFeaturedCourses(limit?: number) {
	const session = await getSession();
	if (!session || session.user.role !== "user") {
		throw new ForbiddenError("Only pending users can access this");
	}

	return await tc(async () => await getUserFeaturedCourses(limit));
}

// ============================================================================
// COMMON/SHARED ACTIONS
// ============================================================================

/**
 * Legacy: Get all courses (used by existing code)
 */
export async function getMyCourses() {
	return await tc(async () => await getCourses());
}

/**
 * Legacy: Add course (used by existing code)
 */
export async function addCourse(title: string, description: string) {
	const result = await tc(async () => await createCourse({ title, description }));
	if (result.success) {
		revalidatePath("/");
	}
	return result;
}

/**
 * Get course by ID
 */
export async function getCourseAction(courseId: number) {
	return await tc(async () => await getCourseById(courseId));
}

/**
 * Get lessons for a course
 */
export async function getCourseLessons(courseId: number) {
	return await tc(async () => await getLessons(courseId));
}

/**
 * Get single lesson
 */
export async function getLessonAction(lessonId: number) {
	return await tc(async () => await getLesson(lessonId));
}

/**
 * Create lesson (requires org_admin or expert role)
 */
export async function createLessonAction(
	courseId: number,
	title: string,
	content?: string
) {
	const session = await getSession();
	if (!session || !["org_admin", "expert"].includes(session.user.role)) {
		throw new ForbiddenError("Only org admins and experts can create lessons");
	}

	const result = await tc(async () =>
		await createLesson({
			courseId: courseId as number,
			title: title as string,
			content: content ?? undefined,
		})
	);

	if (result.success) {
		revalidatePath("/");
	}

	return result;
}

/**
 * Update lesson
 */
export async function updateLessonAction(lessonId: number, title: string, content?: string) {
	const session = await getSession();
	if (!session || !["org_admin", "expert"].includes(session.user.role)) {
		throw new ForbiddenError("Only org admins and experts can update lessons");
	}

	const result = await tc(async () =>
		await updateLesson(lessonId, {
			title: title as string,
			content: content ?? undefined,
		})
	);

	if (result.success) {
		revalidatePath("/");
	}

	return result;
}

/**
 * Reorder lessons (drag & drop)
 */
export async function reorderLessonsAction(courseId: number, lessonOrder: { id: number; order: number }[]) {
	const session = await getSession();
	if (!session || !["org_admin", "expert"].includes(session.user.role)) {
		throw new ForbiddenError("Only org admins and experts can reorder lessons");
	}

	const result = await tc(async () => await reorderLessons(courseId, lessonOrder));

	if (result.success) {
		revalidatePath("/");
	}

	return result;
}

/**
 * Delete lesson
 */
export async function deleteLessonAction(lessonId: number) {
	const session = await getSession();
	if (!session || !["org_admin", "expert"].includes(session.user.role)) {
		throw new ForbiddenError("Only org admins and experts can delete lessons");
	}

	const result = await tc(async () => await softDeleteLesson(lessonId));

	if (result.success) {
		revalidatePath("/");
	}

	return result;
}
