import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getMyOrgMembers } from "@/actions/org.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Shield,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default async function OrgAdminDashboard() {
  const session = await getSession();

  if (!session || session.user.role !== "org_admin") {
    redirect("/auth/signin");
  }

  const members = await getMyOrgMembers();
  const pendingMembers = members.filter((m) => m.role === "user");
  const activeMembers = members.filter((m) => m.role !== "user");
  const experts = activeMembers.filter((m) => m.role === "expert");
  const orgName = session.user.org_slug
    ? session.user.org_slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Your Organization";

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "org_admin": return <Shield className="h-3 w-3" />;
      case "expert": return <GraduationCap className="h-3 w-3" />;
      default: return <UserIcon className="h-3 w-3" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "org_admin": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "expert": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">{orgName}</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            <span className="text-foreground font-medium">{session.user.name}</span>. Here's what's happening today.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/members">
            Manage Members <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Pending Alert */}
      {pendingMembers.length > 0 && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-center gap-4 animate-in fade-in duration-500">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {pendingMembers.length} pending approval{pendingMembers.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              Users are waiting to join your organization.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="border-orange-500/30 hover:bg-orange-500/10 text-orange-500 shrink-0">
            <Link href="/dashboard/members">Review Now</Link>
          </Button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in your org</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experts</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{experts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Course creators</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{pendingMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/courses" className="hover:text-primary transition-colors">
                View courses →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Members */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Members</CardTitle>
              <CardDescription>Latest active members in your organization.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
              <Link href="/dashboard/members">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">No active members yet</p>
                  <p className="text-xs text-muted-foreground">Invite members to get started.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.image || undefined} />
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] flex items-center gap-1 shrink-0 ${getRoleBadgeClass(member.role)}`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Pending */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-start gap-2 w-full">
                <Link href="/dashboard/members">
                  <Users className="h-4 w-4" /> Manage Members
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 w-full">
                <Link href="/dashboard/courses">
                  <BookOpen className="h-4 w-4" /> Browse Courses
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 w-full">
                <Link href="/dashboard/settings">
                  <Shield className="h-4 w-4" /> Organization Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {pendingMembers.length > 0 && (
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" /> Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingMembers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-orange-500/10 text-orange-500">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
                {pendingMembers.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{pendingMembers.length - 3} more waiting...
                  </p>
                )}
                <Button asChild size="sm" className="w-full mt-2">
                  <Link href="/dashboard/members">Review All</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
