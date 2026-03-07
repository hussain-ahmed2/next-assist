import { getSession } from "@/lib/session";
import {
  getMemberInProgressCourses,
  getMemberCompletedCourses,
} from "@/db/query/learning.query";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  GraduationCap,
  ArrowRight,
  Clock,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default async function MemberDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const inProgress = await getMemberInProgressCourses(session.user.id);
  const completed = await getMemberCompletedCourses(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">My Learning</h1>
          <p className="text-muted-foreground">
            Keep up with your professional growth and curriculum.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-full gap-2 border-border/60 hover:border-primary/40 transition-colors"
        >
          <Link href="/learn/catalog">
            <Search className="size-4" /> Explore Catalog
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/10 rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-black tracking-tight">
                  {inProgress.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10 rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Trophy className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-black tracking-tight">
                  {completed.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-border/50 rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                <GraduationCap className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Achievements
                </p>
                <p className="text-2xl font-black tracking-tight">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Active Courses</h2>
          {inProgress.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {inProgress.length} COURSE{inProgress.length !== 1 ? "S" : ""}{" "}
              REMAINING
            </span>
          )}
        </div>

        {inProgress.length === 0 ? (
          <div className="py-24 text-center bg-muted/10 rounded-3xl border border-dashed flex flex-col items-center gap-5">
            <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center">
              <BookOpen className="size-10 opacity-20" />
            </div>
            <div>
              <p className="font-black text-xl tracking-tight">
                Your learning path is clear
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Start your journey by enrolling in a path from the catalog. Your
                progress will appear here.
              </p>
            </div>
            <Button
              asChild
              className="rounded-2xl px-10 h-12 shadow-lg shadow-primary/20"
            >
              <Link href="/learn/catalog">Explore the Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgress.map((progress) => (
              <Card
                key={progress.id}
                className="group border-border/60 hover:border-primary/40 transition-all duration-300 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 bg-card"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-black px-2 py-0.5"
                    >
                      In Progress
                    </Badge>
                    <div className="size-1 rounded-full bg-muted" />
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      Lesson {progress.lessonsCompleted} /{" "}
                      {progress.totalLessons}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black tracking-tighter group-hover:text-primary transition-colors leading-tight">
                    {progress.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black tracking-widest text-muted-foreground">
                      <span>CURRENT PROGRESS</span>
                      <span className="text-primary font-black">
                        {progress.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={progress.progressPercentage}
                      className="h-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span className="text-primary">
                      {progress.lessonsCompleted}
                    </span>
                    <span>/</span>
                    <span>{progress.totalLessons} Lessons Completed</span>
                  </div>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full rounded-2xl h-12 gap-2 font-bold shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    <Link href={`/learn/courses/${progress.courseId}`}>
                      Resume Course <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
