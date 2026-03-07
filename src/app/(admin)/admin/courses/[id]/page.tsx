import { getSuperAdminCourseDetail } from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { AdminCourseEditor } from "@/components/admin/admin-course-editor";

export default async function AdminCourseEditorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getSession();
    
    // Strict Admin enforcement
    if (!session || session.user.role !== "super_admin") {
        redirect("/auth/sign-in");
    }

    const data = await getSuperAdminCourseDetail(parseInt(id));

    if (!data) {
        notFound();
    }

    return (
        <AdminCourseEditor 
            course={data as any} 
            lessons={data.lessons} 
        />
    );
}
