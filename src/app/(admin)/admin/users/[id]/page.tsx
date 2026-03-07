import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { getUserById } from "@/db/query/user.query";
import {
  getExpertCourses,
  getMemberInProgressCourses,
} from "@/db/query/learning.query";
import { AdminUserProfile } from "@/components/admin/admin-user-profile";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.user.role !== "super_admin") {
    redirect("/auth/sign-in");
  }

  const targetUser = await getUserById(id);
  if (!targetUser) {
    notFound();
  }

  // Parallel fetch activity based on role
  const [expertCourses, memberProgress] = await Promise.all([
    targetUser.role === "expert"
      ? getExpertCourses(targetUser.id)
      : Promise.resolve([]),
    targetUser.role === "member"
      ? getMemberInProgressCourses(targetUser.id)
      : Promise.resolve([]),
  ]);

  return (
    <AdminUserProfile
      user={targetUser}
      expertCourses={expertCourses}
      memberProgress={memberProgress}
    />
  );
}
