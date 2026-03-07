import { getMemberCourseDetail, isMemberEnrolled } from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Users, 
  ArrowLeft,
  Calendar,
  Layers,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { EnrollButton } from "@/components/learn/enroll-button";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const courseId = parseInt(id);
  const course = await getMemberCourseDetail(courseId);

  if (!course) {
    notFound();
  }

  const isEnrolled = await isMemberEnrolled(courseId, session.user.id);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Navigation */}
      <Button asChild variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/learn/catalog">
          <ArrowLeft className="size-4" /> Back to Catalog
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-1 font-bold text-[10px] uppercase">
                    Professional Development
                </Badge>
                <div className="size-1 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground font-medium">Published {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {course.description || "Master the core concepts and advanced strategies of this comprehensive curriculum designed for high-performing professionals."}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-border/50">
            <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <Layers className="size-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Lessons</p>
                    <p className="text-sm font-bold">{course.lessons.length} Modules</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <Users className="size-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Category</p>
                    <p className="text-sm font-bold">General</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <ShieldCheck className="size-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Access</p>
                    <p className="text-sm font-bold">Org Restricted</p>
                </div>
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-6 pt-4">
             <h2 className="text-2xl font-black tracking-tight">Curriculum Overview</h2>
             <div className="space-y-3">
                {course.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="group p-4 rounded-2xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-muted-foreground size-6 rounded-full bg-muted/50 flex items-center justify-center">
                                {idx + 1}
                            </span>
                            <h4 className="font-bold tracking-tight text-sm group-hover:text-primary transition-colors">
                                {lesson.title}
                            </h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">15m</span>
                        </div>
                    </div>
                ))}
                {course.lessons.length === 0 && (
                    <p className="text-muted-foreground text-sm italic py-8 border-2 border-dashed rounded-3xl text-center">
                        No lessons have been published for this course yet.
                    </p>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-border/60 shadow-2xl shadow-primary/10 rounded-3xl overflow-hidden">
            <div className="aspect-video bg-muted/50 relative flex items-center justify-center">
                <BookOpen className="size-20 text-primary/10" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
            </div>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                    <p className="text-3xl font-black tracking-tighter">FREE</p>
                    <p className="text-xs text-muted-foreground font-medium">Included with your organization membership</p>
                </div>

                {isEnrolled ? (
                    <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold gap-2 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20">
                        <Link href={`/learn/courses/${course.id}/viewer`}>
                            <PlayCircle className="size-6" /> Continue Learning
                        </Link>
                    </Button>
                ) : (
                    <EnrollButton courseId={course.id} />
                )}

                <div className="space-y-4 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">This course includes:</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <PlayCircle className="size-4 text-primary" />
                            <span>Structured video & text modules</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span>Certificate of Completion</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <Calendar className="size-4 text-primary" />
                            <span>Lifetime access</span>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
