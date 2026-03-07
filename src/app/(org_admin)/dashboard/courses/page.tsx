import { getCourses } from "@/db/query/learning.query";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CreateCourseDialog } from "@/components/dashboard/create-course-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, MoreVertical, PenLine } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
  const session = await getSession();
  if (!session || session.user.role !== "org_admin") redirect("/auth/signin");

  const courses = await getCourses();
  const published = courses.filter((c) => c.published);
  const drafts = courses.filter((c) => !c.published);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Courses</h1>
          <p className="text-muted-foreground">
            Create and manage your organization's learning curriculum.
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>
          <span className="font-bold text-foreground">{courses.length}</span> total
        </span>
        <span>
          <span className="font-bold text-green-500">{published.length}</span> published
        </span>
        <span>
          <span className="font-bold text-orange-500">{drafts.length}</span> drafts
        </span>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/10 rounded-3xl border border-dashed border-border gap-5">
          <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl">No courses yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Start building your first learning path for your members.
            </p>
          </div>
          <CreateCourseDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex flex-col"
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-linear-to-br from-primary/10 via-muted/20 to-muted/5 relative flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary/30" />
                <div className="absolute top-3 right-3">
                  {!course.published ? (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                      Draft
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-base leading-snug line-clamp-2 mb-2">
                  {course.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                  {course.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(course.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-primary hover:bg-primary/10 gap-1"
                  >
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <PenLine className="h-3 w-3" /> Edit
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
