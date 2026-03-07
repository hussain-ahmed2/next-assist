import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { actionGetAllCourses } from "@/actions/course.action";
import { CourseTable } from "@/components/admin/course-table";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminCoursesPage() {
    const session = await getSession();
    if (!session || session.user.role !== "super_admin") {
        redirect("/auth/sign-in");
    }

    const courses = await actionGetAllCourses();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global Catalog</h1>
                    <p className="text-muted-foreground text-sm">
                        Oversight of every course and lesson across the entire platform.
                    </p>
                </div>
                <div />
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <CourseTable data={courses} />
                </CardContent>
            </Card>
        </div>
    );
}
