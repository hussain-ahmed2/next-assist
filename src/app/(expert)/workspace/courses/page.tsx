import { getExpertCourses } from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CreateCourseDialog } from "@/components/dashboard/create-course-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, PenLine, Plus } from "lucide-react";
import Link from "next/link";

export default async function ExpertCoursesPage() {
  const session = await getSession();
  if (!session || session.user.role !== "expert") redirect("/auth/signin");

  const courses = await getExpertCourses(session.user.id);
  const published = courses.filter((c) => c.published);
  const drafts = courses.filter((c) => !c.published);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">My Catalog</h1>
          <p className="text-muted-foreground">
            View and manage the educational content you've created.
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            <span><span className="font-bold text-foreground">{courses.length}</span> Total Courses</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500" />
            <span><span className="font-bold text-green-500">{published.length}</span> Published</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-orange-500" />
            <span><span className="font-bold text-orange-500">{drafts.length}</span> Drafts</span>
        </div>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/10 rounded-3xl border border-dashed border-border gap-5">
          <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground opacity-30" />
          </div>
          <div className="text-center">
            <h3 className="font-black text-2xl tracking-tight">Empty Portfolio</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
              You haven't created any courses yet. Share your expertise with the community.
            </p>
          </div>
          <CreateCourseDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col"
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-linear-to-br from-primary/10 via-muted/20 to-muted/5 relative flex items-center justify-center">
                <div className="size-16 rounded-full bg-background/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute top-4 right-4">
                  {!course.published ? (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] font-bold uppercase">
                      Draft
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-bold uppercase">
                      Live
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-lg leading-tight line-clamp-2 mb-2 tracking-tight">
                  {course.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {course.description || "No description provided for this catalog item."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(course.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="gap-2 shadow-sm"
                  >
                    <Link href={`/workspace/courses/${course.id}`}>
                      <PenLine className="h-3.5 w-3.5" /> Edit Course
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
