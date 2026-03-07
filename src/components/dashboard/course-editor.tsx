"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  Trash2,
  GripVertical,
  BookOpen,
  Eye,
  EyeOff,
  ArrowLeft,
  PenLine,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import {
  actionUpdateCourse,
  actionDeleteCourse,
  actionCreateLesson,
  actionUpdateLesson,
  actionDeleteLesson,
} from "@/actions/course.action";

type Lesson = {
  id: number;
  title: string;
  content: string | null;
  order: number;
};

type Course = {
  id: number;
  title: string;
  description: string | null;
  published: boolean;
};

export function CourseEditor({
  course: initialCourse,
  lessons: initialLessons,
  backUrl = "/dashboard/courses",
}: {
  course: Course;
  lessons: Lesson[];
  backUrl?: string;
}) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [lessons, setLessons] = useState(initialLessons);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDescription, setEditDescription] = useState(
    course.description || "",
  );
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [lessonEdits, setLessonEdits] = useState<
    Record<number, { title: string; content: string }>
  >({});
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      const result = await actionUpdateCourse(course.id, {
        title: editTitle,
        description: editDescription,
      });
      if (result.success) {
        setCourse((prev) => ({
          ...prev,
          title: editTitle,
          description: editDescription || null,
        }));
        setIsEditingCourse(false);
        toast.success("Course updated!");
        startTransition(() => router.refresh());
      } else {
        toast.error(result.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsSaving(true);
    try {
      const result = await actionUpdateCourse(course.id, {
        published: !course.published,
      });
      if (result.success) {
        setCourse((prev) => ({ ...prev, published: !prev.published }));
        toast.success(
          course.published ? "Course unpublished" : "Course published!",
        );
        startTransition(() => router.refresh());
      } else {
        toast.error(result.message || "Failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setIsAddingLesson(true);
    try {
      const result = await actionCreateLesson(course.id, {
        title: newLessonTitle.trim(),
        order: lessons.length,
      });
      if (result.success) {
        setLessons((prev) => [...prev, result.data!]);
        setNewLessonTitle("");
        setAddLessonOpen(false);
        toast.success("Lesson added!");
      } else {
        toast.error(result.message || "Failed to add lesson");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    const edits = lessonEdits[lesson.id];
    if (!edits) return;
    try {
      const result = await actionUpdateLesson(lesson.id, course.id, {
        title: edits.title,
        content: edits.content,
      });
      if (result.success) {
        setLessons((prev) =>
          prev.map((l) => (l.id === lesson.id ? { ...l, ...edits } : l)),
        );
        setLessonEdits((prev) => {
          const copy = { ...prev };
          delete copy[lesson.id];
          return copy;
        });
        toast.success("Lesson saved!");
      } else {
        toast.error(result.message || "Failed to save lesson");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    setDeletingId(lessonId);
    try {
      const result = await actionDeleteLesson(lessonId, course.id);
      if (result.success) {
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        toast.success("Lesson deleted");
      } else {
        toast.error(result.message || "Failed");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={backUrl}
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Courses
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {course.title}
        </span>
      </div>

      {/* Course Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditingCourse ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe what this course covers..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveCourse}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingCourse(false);
                      setEditTitle(course.title);
                      setEditDescription(course.description || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-black tracking-tight">
                    {course.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className={
                      course.published
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                    }
                  >
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <CardDescription>
                  {course.description || "No description yet."}
                </CardDescription>
              </div>
            )}
          </div>
          {!isEditingCourse && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingCourse(true)}
              >
                <PenLine className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant={course.published ? "outline" : "default"}
                size="sm"
                onClick={handleTogglePublish}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : course.published ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" /> Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" /> Publish
                  </>
                )}
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Lessons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Lessons</h2>
            <p className="text-sm text-muted-foreground">
              {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} in this
              course
            </p>
          </div>
          <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Lesson</DialogTitle>
                <DialogDescription>
                  Create a new lesson in this course.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLesson} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Lesson Title</Label>
                  <Input
                    placeholder="e.g. Introduction & Overview"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    disabled={isAddingLesson}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddLessonOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddingLesson}>
                    {isAddingLesson ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Add Lesson
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border gap-3 text-center">
            <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No lessons yet</p>
              <p className="text-xs text-muted-foreground">
                Add your first lesson to start building this course.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const isExpanded = expandedLesson === lesson.id;
              const edit = lessonEdits[lesson.id];
              return (
                <Card key={lesson.id} className="border-border">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-xl"
                    onClick={() =>
                      setExpandedLesson(isExpanded ? null : lesson.id)
                    }
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium flex-1 truncate">
                      {lesson.title}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <CardContent className="border-t border-border pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={edit?.title ?? lesson.title}
                          onChange={(e) =>
                            setLessonEdits((prev) => ({
                              ...prev,
                              [lesson.id]: {
                                title: e.target.value,
                                content:
                                  prev[lesson.id]?.content ??
                                  lesson.content ??
                                  "",
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          placeholder="Write your lesson content here..."
                          rows={8}
                          value={edit?.content ?? lesson.content ?? ""}
                          onChange={(e) =>
                            setLessonEdits((prev) => ({
                              ...prev,
                              [lesson.id]: {
                                title: prev[lesson.id]?.title ?? lesson.title,
                                content: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={deletingId === lesson.id}
                        >
                          {deletingId === lesson.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete Lesson
                        </Button>
                        {edit && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveLesson(lesson)}
                          >
                            <Save className="h-4 w-4 mr-2" /> Save Lesson
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
