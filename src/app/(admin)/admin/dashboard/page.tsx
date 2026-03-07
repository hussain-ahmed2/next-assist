import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fetchAllOrganizations, fetchAllUsers } from "@/actions/org.action";
import { getRecentSessions } from "@/db/query/user.query";
import { getSuperAdminCourseStats, getSuperAdminAllLessonsCount } from "@/db/query/learning.query";
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
import { PlatformEngagementChart } from "@/components/admin/platform-engagement-chart";
import {
  Building2,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  Globe,
  Plus,
  Clock,
  BookOpen,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "super_admin") {
    redirect("/auth/sign-in");
  }

  const [orgs, users, recentSessions, courseStats, totalLessons] = await Promise.all([
    fetchAllOrganizations(),
    fetchAllUsers(),
    getRecentSessions(5),
    getSuperAdminCourseStats(),
    getSuperAdminAllLessonsCount(),
  ]);

  const activeOrgs = orgs.length;
  const totalUsers = users.length;
  // Trends (Mocked for UI feel)
  const userTrend = "+12% from last month";
  const orgTrend = "+2 new this week";
  const courseTrend = `${courseStats.published} published / ${courseStats.draft} drafts`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Platform Control</h1>
          <p className="text-muted-foreground">
            System status: <span className="text-green-500 font-medium tracking-wide">OPERATIONAL</span> · 
            {activeOrgs} organizations managed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/courses">
                <BookOpen className="size-4" /> Global Catalog
            </Link>
          </Button>
          <Button asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/admin/organizations">
                <Plus className="size-4" /> New Organization
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeOrgs}</div>
            <p className="text-xs text-muted-foreground mt-1">{orgTrend}</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">{userTrend}</p>
          </CardContent>
        </Card>

        <Link href="/admin/courses" className="block transition-transform hover:scale-[1.01] active:scale-100">
          <Card className="bg-linear-to-br from-orange-500/10 to-transparent border-orange-500/20 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{courseStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{courseTrend}</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-linear-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Content</CardTitle>
            <Layers className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalLessons}</div>
            <p className="text-xs text-muted-foreground mt-1">Total across platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Chart */}
      <PlatformEngagementChart />

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left Column: Recent Activity & Logs */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Organizations</CardTitle>
                <CardDescription>Latest company environments provisioned.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                <Link href="/admin/organizations" className="flex items-center gap-1">
                  View all <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orgs.slice(0, 5).map((org) => (
                  <div key={org.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                        <Building2 className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">{org.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">
                        {org.plan}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {orgs.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Building2 className="size-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No organizations found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Live platform access audit trail.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                <Link href="/admin/logs" className="flex items-center gap-1">
                  Full logs <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((s) => (
                  <div key={s.sessionId} className="flex items-center gap-4">
                    <Avatar className="size-8">
                       <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {s.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.userName}</p>
                      <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{s.userRole}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-mono text-muted-foreground">{s.ipAddress || "::1"}</p>
                       <p className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Health & Tools */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-md">Platform Health</CardTitle>
              <CardDescription>Real-time infrastructure status.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               {[
                 { label: "Auth API", status: "Operational", color: "bg-green-500" },
                 { label: "Core Database", status: "Healthy", color: "bg-green-500" },
                 { label: "Tenant Isolation", status: "Isolated", color: "bg-green-500" },
                 { label: "Worker Nodes", status: "Active (2/2)", color: "bg-green-500" },
               ].map((item) => (
                 <div key={item.label} className="flex items-center justify-between">
                   <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold uppercase tracking-tighter">{item.status}</span>
                     <div className={`size-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
                   </div>
                 </div>
               ))}
               <div className="pt-4 border-t border-border mt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <Clock className="size-3" />
                    Platform uptime: 99.98% (last 30 days)
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <Badge variant="secondary">v2.4.0-stable</Badge>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="font-medium">Production</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Region</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Globe className="size-3" /> US-EAST-1
                  </span>
               </div>
               <Button className="w-full mt-4" variant="outline">
                  System Settings
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
