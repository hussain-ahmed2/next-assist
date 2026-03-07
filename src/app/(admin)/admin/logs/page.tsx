import { getRecentSessions } from "@/db/query/user.query";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Activity,
  Monitor,
  Globe,
  Clock,
  Users,
} from "lucide-react";

function parseDevice(userAgent: string | null) {
  if (!userAgent) return "Unknown Device";
  if (/Mobile|Android|iPhone/i.test(userAgent)) return "Mobile";
  if (/Tablet|iPad/i.test(userAgent)) return "Tablet";
  return "Desktop";
}

function parseBrowser(userAgent: string | null) {
  if (!userAgent) return "Unknown";
  if (/Chrome/i.test(userAgent) && !/Chromium|Edge/i.test(userAgent)) return "Chrome";
  if (/Firefox/i.test(userAgent)) return "Firefox";
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return "Safari";
  if (/Edge/i.test(userAgent)) return "Edge";
  return "Browser";
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "super_admin": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "org_admin": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "expert": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "member": return "bg-primary/10 text-primary border-primary/20";
    default: return "bg-muted/50 text-muted-foreground border-border";
  }
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function LogsPage() {
  const currentSession = await getSession();
  if (!currentSession || currentSession.user.role !== "super_admin") {
    redirect("/auth/signin");
  }

  const sessions = await getRecentSessions(100);
  const activeSessions = sessions.filter(
    (s) => new Date(s.expiresAt) > new Date()
  );
  const uniqueUsers = new Set(sessions.map((s) => s.userId)).size;
  const mobileCount = sessions.filter((s) =>
    /Mobile|Android|iPhone/i.test(s.userAgent || "")
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter">System Logs</h1>
        <p className="text-muted-foreground">
          Monitor platform activity, session data, and access patterns.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{sessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time login events</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently logged in</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Distinct accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Logins</CardTitle>
            <Monitor className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{mobileCount}</div>
            <p className="text-xs text-muted-foreground mt-1">From mobile devices</p>
          </CardContent>
        </Card>
      </div>

      {/* Session Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Session Audit Trail
          </CardTitle>
          <CardDescription>
            {sessions.length} login event{sessions.length !== 1 ? "s" : ""} recorded on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>No sessions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Organization</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Device</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">IP Address</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Session</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => {
                    const isActive = new Date(s.expiresAt) > new Date();
                    return (
                      <tr key={s.sessionId} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                {s.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{s.userName}</p>
                              <p className="text-xs text-muted-foreground truncate">{s.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-[10px] rounded-full ${getRoleBadgeClass(s.userRole)}`}>
                            {s.userRole}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {s.org_slug ? (
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {s.org_slug}
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Platform</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Monitor className="h-3.5 w-3.5 shrink-0" />
                            {parseDevice(s.userAgent)} · {parseBrowser(s.userAgent)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            {s.ipAddress || "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              isActive
                                ? "bg-green-500/10 text-green-500 border-green-500/20 text-[10px]"
                                : "bg-muted/50 text-muted-foreground text-[10px]"
                            }
                          >
                            {isActive ? "Active" : "Expired"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo(s.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
