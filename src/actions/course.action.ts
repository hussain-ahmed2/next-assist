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
} from "@/db/query/learning.query";

function requireOrgAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session || session.user.role !== "org_admin") {
    throw new ForbiddenError("Only Org Admins can perform this action");
  }
}

export async function actionGetCourses() {
  const session = await getSession();
  requireOrgAdmin(session);
  return await getCourses();
}

export async function actionCreateCourse(data: { title: string; description?: string }) {
  return await tc(async () => {
    const session = await getSession();
    requireOrgAdmin(session);
    const course = await createCourse({ title: data.title, description: data.description || null });
    revalidatePath("/dashboard/courses");
    return course;
  });
}

export async function actionUpdateCourse(id: number, data: { title?: string; description?: string; published?: boolean }) {
  return await tc(async () => {
    const session = await getSession();
    requireOrgAdmin(session);
    const course = await updateCourse(id, data);
    revalidatePath("/dashboard/courses");
    revalidatePath(`/dashboard/courses/${id}`);
    return course;
  });
}

export async function actionDeleteCourse(id: number) {
  return await tc(async () => {
    const session = await getSession();
    requireOrgAdmin(session);
    await softDeleteCourse(id);
    revalidatePath("/dashboard/courses");
    return { success: true };
  });
}

export async function actionGetCourseById(id: number) {
  const session = await getSession();
  requireOrgAdmin(session);
  return await getCourseById(id);
}

export async function actionGetLessons(courseId: number) {
  const session = await getSession();
  requireOrgAdmin(session);
  return await getLessons(courseId);
}

export async function actionCreateLesson(courseId: number, data: { title: string; content?: string; order?: number }) {
  return await tc(async () => {
    const session = await getSession();
    requireOrgAdmin(session);
    const lesson = await createLesson({ courseId, title: data.title, content: data.content, order: data.order ?? 0 });
    revalidatePath(`/dashboard/courses/${courseId}`);
    return lesson;
  });
}

export async function actionUpdateLesson(id: number, courseId: number, data: { title?: string; content?: string; order?: number }) {
  return await tc(async () => {
    const session = await getSession();
    requireOrgAdmin(session);
    const lesson = await updateLesson(id, data);
    revalidatePath(`/dashboard/courses/${courseId}`);
    return lesson;
  });
}

export async function actionDeleteLesson(id: number, courseId: number) {
  return await tc(async () => {
    const session = await getSession();
    requireOrgAdmin(session);
    await softDeleteLesson(id);
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  });
}
