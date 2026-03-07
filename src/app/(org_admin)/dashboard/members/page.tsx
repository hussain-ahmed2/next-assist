import { getMyOrgMembers } from "@/actions/org.action";
import MembersList from "@/components/dashboard/members-list";
import { getSession } from "@/lib/session";

export default async function MembersPage() {
  const members = await getMyOrgMembers();
  const session = await getSession();

  // Explicitly cast/transform data for the client component if needed
  const formattedMembers = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    image: m.image,
    createdAt: m.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">Members</h1>
        <p className="text-muted-foreground">
          Manage your organization's team and student roster.
        </p>
      </div>
      <MembersList 
        initialMembers={formattedMembers} 
        currentUserId={session?.user.id || ""}
      />
    </div>
  );
}
