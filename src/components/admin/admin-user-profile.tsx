"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Shield,
  Building2,
  Layout,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { User as UserType } from "@/db/schema";

type Props = {
  user: UserType;
  expertCourses: any[];
  memberProgress: any[];
};

export function AdminUserProfile({
  user,
  expertCourses,
  memberProgress,
}: Props) {
  const isExpert = user.role === "expert";
  const isMember = user.role === "member";
  const isAdmin = user.role === "super_admin" || user.role === "org_admin";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/admin/users">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">
              User Profile
            </h1>
            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest flex items-center gap-2">
              System ID:{" "}
              <span className="text-foreground font-mono">
                {user.id.slice(0, 8)}...
              </span>
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest"
        >
          {user.role} Control
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <div className="h-24 bg-linear-to-br from-primary/20 to-primary/5" />
            <CardContent className="relative pt-0 px-6 pb-8">
              <div className="absolute -top-12 left-6">
                <Avatar className="size-24 border-4 border-background shadow-xl">
                  <AvatarImage src={user.image!} />
                  <AvatarFallback className="text-3xl font-black bg-primary text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-16 space-y-1">
                <h2 className="text-2xl font-black tracking-tighter">
                  {user.name}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {user.email}
                </p>
              </div>

              <div className="mt-8 space-y-4 pt-6 border-t border-border/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Shield className="size-4" /> Role
                  </span>
                  <Badge variant="secondary" className="capitalize font-bold">
                    {user.role.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Building2 className="size-4" /> Organization
                  </span>
                  <span className="font-bold">
                    {user.org_slug || "Platform"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Calendar className="size-4" /> Joined
                  </span>
                  <span className="font-bold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start gap-2 h-10 font-bold"
                variant="outline"
              >
                <Mail className="size-4" /> Send Notification
              </Button>
              <Button
                className="w-full justify-start gap-2 h-10 font-bold"
                variant="outline"
              >
                <Shield className="size-4" /> Reset Permissions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Activity & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expert Activity */}
          {isExpert && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">
                    Expert Catalog
                  </CardTitle>
                  <CardDescription>
                    Courses created and managed by this investigator.
                  </CardDescription>
                </div>
                <Layout className="size-5 text-primary" />
              </CardHeader>
              <CardContent>
                {expertCourses.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic text-sm bg-muted/30 rounded-2xl">
                    This expert hasn't deployed any courses yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {expertCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BookOpen className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold tracking-tight">
                              {course.title}
                            </p>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                              {course.published ? (
                                <span className="text-green-500 flex items-center gap-1">
                                  <CheckCircle2 className="size-3" /> Live
                                </span>
                              ) : (
                                <span className="text-orange-500 flex items-center gap-1">
                                  <Clock className="size-3" /> Draft
                                </span>
                              )}
                              · Updated{" "}
                              {new Date(course.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link href={`/admin/courses/${course.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Member Progress */}
          {isMember && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">
                    Learning Progress
                  </CardTitle>
                  <CardDescription>
                    Current curriculum and completion status.
                  </CardDescription>
                </div>
                <Activity className="size-5 text-primary" />
              </CardHeader>
              <CardContent>
                {memberProgress.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic text-sm bg-muted/30 rounded-2xl">
                    This member is not currently enrolled in any paths.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {memberProgress.map((prog) => (
                      <div
                        key={prog.id}
                        className="p-4 rounded-2xl border border-border/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold tracking-tight">
                            {prog.title}
                          </p>
                          <span className="text-xs font-black text-primary">
                            {prog.progressPercentage}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${prog.progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          Node {prog.lessonsCompleted} / {prog.totalLessons}{" "}
                          Completed
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generic Activity Logs (Placeholder for now) */}
          <Card className="border-border/60 shadow-sm border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" /> System
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-70 italic text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                  <span>Last Login: Today at 2:14 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                  <span>API Access: 42 requests in last 24h</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                  <span>Identity changed by System Admin at 2026/03/06</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
