import {
  getMemberCourseDetail,
  getMemberLesson,
} from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import {
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default async function LessonViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { id } = await params;
  const { lesson: lessonIdStr } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const courseId = parseInt(id);
  const course = await getMemberCourseDetail(courseId);

  if (!course) {
    notFound();
  }

  const currentLessonId = lessonIdStr
    ? parseInt(lessonIdStr)
    : course.lessons[0]?.id;
  const currentLesson = currentLessonId
    ? await getMemberLesson(currentLessonId)
    : null;

  const currentIdx = course.lessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIdx > 0 ? course.lessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx < course.lessons.length - 1
      ? course.lessons[currentIdx + 1]
      : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row overflow-hidden -m-4 lg:-m-8">
      {/* Sidebar - Lessons List */}
      <div className="w-full lg:w-80 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href={`/learn/courses/${course.id}`}>
              <ArrowLeft className="size-4" /> Exit Course
            </Link>
          </Button>
          <h2 className="font-black tracking-tighter text-lg leading-tight line-clamp-2">
            {course.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full">
              <div className="h-full bg-primary rounded-full w-[15%]" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase">
              15%
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {course.lessons.map((lesson, idx) => (
              <Link
                key={lesson.id}
                href={`/learn/courses/${course.id}/viewer?lesson=${lesson.id}`}
                className={`
                    flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group
                    ${currentLessonId === lesson.id ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"}
                `}
              >
                <div
                  className={`
                    size-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs
                    ${currentLessonId === lesson.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted group-hover:bg-muted-foreground/10"}
                 `}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-bold truncate ${currentLessonId === lesson.id ? "text-primary" : ""}`}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60">
                    15 min
                  </p>
                </div>
                {currentIdx > idx && (
                  <CheckCircle2 className="size-4 text-green-500" />
                )}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
        {currentLesson ? (
          <>
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto p-8 lg:p-12 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/5 text-primary border-primary/10 uppercase tracking-widest text-[10px] font-black"
                    >
                      Module {currentIdx + 1}
                    </Badge>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Core Concepts
                    </span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                    {currentLesson.title}
                  </h1>
                </div>

                {/* Content Placeholder */}
                <div className="bg-card border border-border/50 rounded-3xl p-8 lg:p-12 shadow-xl shadow-primary/5 min-h-[400px]">
                  <article className="prose prose-sm lg:prose-base dark:prose-invert max-w-none leading-relaxed">
                    {currentLesson.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.content.replace(/\n/g, "<br/>"),
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <BookOpen className="size-16 text-muted-foreground opacity-10" />
                        <p className="text-muted-foreground italic">
                          No content has been added to this lesson yet.
                        </p>
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </ScrollArea>

            {/* Bottom Navigation Bar */}
            <div className="h-20 bg-card border-t border-border px-8 flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              <Button
                asChild={!!prevLesson}
                variant="ghost"
                disabled={!prevLesson}
                className="rounded-full gap-2 font-bold h-12 px-6"
              >
                {prevLesson ? (
                  <Link
                    href={`/learn/courses/${course.id}/viewer?lesson=${prevLesson.id}`}
                  >
                    <ChevronLeft className="size-4" /> Previous Lesson
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="size-4 inline mr-2" /> Start of
                    Course
                  </span>
                )}
              </Button>

              <div className="hidden md:flex flex-col items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  Lesson progress
                </span>
                <div className="flex items-center gap-1">
                  {course.lessons.map((l, i) => (
                    <div
                      key={l.id}
                      className={`h-1.5 w-6 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>

              <Button
                asChild={!!nextLesson}
                variant={nextLesson ? "default" : "outline"}
                disabled={!nextLesson}
                className="rounded-full gap-2 font-bold h-12 px-6 shadow-lg shadow-primary/10"
              >
                {nextLesson ? (
                  <Link
                    href={`/learn/courses/${course.id}/viewer?lesson=${nextLesson.id}`}
                  >
                    Next Lesson <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span className="text-green-600 border-green-200">
                    <CheckCircle2 className="size-4 inline mr-2" /> Complete
                    Course
                  </span>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <BookOpen className="size-24 text-muted-foreground opacity-10" />
            <h2 className="text-2xl font-black tracking-tight">
              Ready to start?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select a lesson from the sidebar to begin your journey through{" "}
              {course.title}.
            </p>
            {course.lessons.length > 0 && (
              <Button asChild className="rounded-2xl h-12 px-8 mt-4">
                <Link
                  href={`/learn/courses/${course.id}/viewer?lesson=${course.lessons[0].id}`}
                >
                  Start First Lesson
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
