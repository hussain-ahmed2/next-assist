import { getExpertCourseWithLessons } from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { CourseEditor } from "@/components/dashboard/course-editor";

export default async function ExpertCourseEditorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.user.role !== "expert") redirect("/auth/signin");

    const data = await getExpertCourseWithLessons(parseInt(id), session.user.id);

    if (!data) {
        notFound();
    }

    return (
        <CourseEditor 
            course={data} 
            lessons={data.lessons} 
            backUrl="/workspace/courses" 
        />
    );
}
