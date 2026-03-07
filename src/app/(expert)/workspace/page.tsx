import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getExpertCourses } from "@/db/query/learning.query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Plus, 
  ArrowRight, 
  Zap, 
  Crown,
  LayoutDashboard,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ExpertWorkspacePage() {
  const session = await getSession();
  if (!session || session.user.role !== "expert") {
    redirect("/auth/signin");
  }

  // Experts only see courses they created
  const expertCourses = await getExpertCourses(session.user.id);
  const publishedCount = expertCourses.filter((c: any) => c.published).length;
  
  return (
    <div className="space-y-8">
       {/* Header */}
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Expert Hub</h1>
          <p className="text-muted-foreground">
            Manage your educational portfolio and student engagement.
          </p>
        </div>
        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
          <Link href="/workspace/courses">
            <Plus className="size-4" /> Create New Course
          </Link>
        </Button>
      </div>

       {/* Quick Stats */}
       <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{expertCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total content units</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500/10 to-transparent border-green-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">0</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled members</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500/10 to-transparent border-purple-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Status</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{publishedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Courses in production</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Course List Wrapper */}
        <Card className="lg:col-span-5 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20">
                <div>
                    <CardTitle>Content Portfolio</CardTitle>
                    <CardDescription>Courses created and managed by you.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/workspace/courses">Manage Catalog</Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {expertCourses.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <BookOpen className="size-8 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-lg font-bold">No courses yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                            Start building your educational content to share with organization members.
                        </p>
                        <Button asChild>
                            <Link href="/workspace/courses">Create your first course</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {expertCourses.slice(0, 5).map((course: any) => (
                            <div key={course.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                     <div className="size-12 rounded bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <GraduationCap className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold tracking-tight">{course.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                                            {course.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={course.published ? "default" : "secondary"} className="text-[10px] font-bold uppercase tracking-wider">
                                        {course.published ? "Live" : "Draft"}
                                    </Badge>
                                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                        <Link href={`/dashboard/courses/${course.id}`}>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Support & Tools */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-sm">Expert Toolkit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                    {[
                        { icon: LayoutDashboard, label: "Engagement Hub", url: "#" },
                        { icon: Zap, label: "Global Templates", url: "#" },
                        { icon: Users, label: "Member Audit", url: "#" },
                    ].map((item, idx) => (
                        <Link 
                            key={idx} 
                            href={item.url} 
                            className="flex items-center gap-3 p-4 hover:bg-primary/10 transition-colors border-t border-primary/10"
                        >
                            <item.icon className="size-4 text-primary" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <div className="p-6 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                <Crown className="size-8 mb-4 opacity-50" />
                <h4 className="text-lg font-black tracking-tighter mb-1">Scale your impact</h4>
                <p className="text-xs opacity-80 mb-4 leading-relaxed">
                    Higher engagement scores increase your visibility across the organization.
                </p>
                <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-600 border-none hover:bg-white/90">
                    Read Guidelines
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
