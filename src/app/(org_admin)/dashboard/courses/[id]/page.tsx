import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { getCourseById, getLessons } from "@/db/query/learning.query";
import { CourseEditor } from "@/components/dashboard/course-editor";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "org_admin") redirect("/auth/signin");

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) notFound();

  const [course, lessons] = await Promise.all([
    getCourseById(courseId),
    getLessons(courseId),
  ]);

  if (!course) notFound();

  const safeLessons = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    content: l.content ?? null,
    order: l.order,
  }));

  return (
    <CourseEditor
      course={{
        id: course.id,
        title: course.title,
        description: course.description ?? null,
        published: course.published,
      }}
      lessons={safeLessons}
    />
  );
}
