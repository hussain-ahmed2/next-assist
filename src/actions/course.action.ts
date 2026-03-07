"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ForbiddenError } from "@/lib/errors";
import { tc } from "@/lib/async";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  softDeleteCourse,
  getLessons,
  createLesson,
  updateLesson,
  softDeleteLesson,
  reorderLessons,
  enrollMemberInCourse,
} from "@/db/query/learning.query";

async function requireCourseEditor(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) throw new ForbiddenError("Not authenticated");
  const role = session.user.role;
  if (role !== "org_admin" && role !== "expert" && role !== "super_admin") {
    throw new ForbiddenError("Only Admins and Experts can perform this action");
  }
}

export async function actionGetCourses() {
  const session = await getSession();
  await requireCourseEditor(session);
  return await getCourses();
}

export async function actionCreateCourse(data: { title: string; description?: string }) {
  return await tc(async () => {
    const session = await getSession();
    await requireCourseEditor(session);
    const course = await createCourse({ 
      title: data.title, 
      description: data.description || null,
      creatorId: session!.user.id 
    });
    revalidatePaths(null);
    return course;
  });
}

export async function actionUpdateCourse(id: number, data: { title?: string; description?: string; published?: boolean }) {
  return await tc(async () => {
    const session = await getSession();
    await requireCourseEditor(session);
    const course = await updateCourse(id, data);
    revalidatePaths(id);
    return course;
  });
}

export async function actionDeleteCourse(id: number) {
  return await tc(async () => {
    const session = await getSession();
    await requireCourseEditor(session);
    await softDeleteCourse(id);
    revalidatePaths(null);
    return { success: true };
  });
}

export async function actionGetCourseById(id: number) {
  const session = await getSession();
  await requireCourseEditor(session);
  return await getCourseById(id);
}

export async function actionGetLessons(courseId: number) {
  const session = await getSession();
  await requireCourseEditor(session);
  return await getLessons(courseId);
}

export async function actionCreateLesson(courseId: number, data: { title: string; content?: string; order?: number }) {
  return await tc(async () => {
    const session = await getSession();
    await requireCourseEditor(session);
    const lesson = await createLesson({ courseId, title: data.title, content: data.content, order: data.order ?? 0 });
    revalidatePaths(courseId);
    return lesson;
  });
}

export async function actionUpdateLesson(id: number, courseId: number, data: { title?: string; content?: string; order?: number }) {
  return await tc(async () => {
    const session = await getSession();
    await requireCourseEditor(session);
    const lesson = await updateLesson(id, data);
    revalidatePaths(courseId);
    return lesson;
  });
}

export async function actionDeleteLesson(id: number, courseId: number) {
  return await tc(async () => {
    const session = await getSession();
    await requireCourseEditor(session);
    await softDeleteLesson(id);
    revalidatePaths(courseId);
    return { success: true };
  });
}

export async function actionEnrollMember(courseId: number) {
  return await tc(async () => {
    const session = await getSession();
    if (!session) throw new ForbiddenError("Not authenticated");
    
    await enrollMemberInCourse(courseId, session.user.id);
    
    revalidatePaths(courseId);
    return { success: true };
  });
}

export async function actionGetAllCourses() {
  const session = await getSession();
  if (!session || session.user.role !== "super_admin") {
    throw new ForbiddenError("Only Super Admins can perform this action");
  }
  const { getSuperAdminAllCourses } = await import("@/db/query/learning.query");
  return await getSuperAdminAllCourses();
}

function revalidatePaths(courseId: number | null) {
    revalidatePath("/dashboard/courses");
    revalidatePath("/workspace/courses");
    revalidatePath("/learn/catalog");
    revalidatePath("/learn");
    if (courseId) {
        revalidatePath(`/dashboard/courses/${courseId}`);
        revalidatePath(`/workspace/courses/${courseId}`);
        revalidatePath(`/learn/courses/${courseId}`);
    }
}
