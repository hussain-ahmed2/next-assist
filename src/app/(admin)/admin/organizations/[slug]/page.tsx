import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/db/query/organization.query";
import { getAllUsers } from "@/db/query/user.query";
import { getExpertCourses } from "@/db/query/learning.query";
import { AdminOrgProfile } from "@/components/admin/admin-org-profile";

export default async function AdminOrgProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "super_admin") {
        redirect("/auth/sign-in");
    }

    const org = await getOrganizationBySlug(slug);
    if (!org) {
        notFound();
    }

    const members = await getAllUsers(slug);

    // Map members to the format the table expects
    const tableMembers = members.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        org_slug: u.org_slug,
        createdAt: new Date(u.createdAt).toLocaleDateString(),
        status: "Done" as const
    }));

    // For simplicity, we'll fetch courses for all experts in this org
    const experts = members.filter(u => u.role === "expert");
    const coursesPromises = experts.map(e => getExpertCourses(e.id));
    const allCoursesResults = await Promise.all(coursesPromises);
    const totalCourses = allCoursesResults.reduce((acc, current) => acc + current.length, 0);

    return (
        <AdminOrgProfile 
            organization={org as any}
            members={tableMembers}
            coursesCount={totalCourses}
        />
    );
}
