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
  Info,
  ShieldAlert,
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
  creatorId: string;
  createdAt: any;
};

export function AdminCourseEditor({
  course: initialCourse,
  lessons: initialLessons,
}: {
  course: Course;
  lessons: Lesson[];
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
        toast.success("Course modified as Admin");
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
        toast.success("Lesson inserted into stream");
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
        toast.success("Content modification saved");
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
        toast.success("Lesson purged precisely");
      } else {
        toast.error(result.message || "Failed");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Admin Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/courses"
          className="hover:text-primary flex items-center gap-1 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Global Catalog
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold truncate">
           [ADMIN] {course.title}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
            <div className="bg-primary/10 px-6 py-2 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-primary/60">
                <ShieldAlert className="size-3" /> Elevated Oversight Mode
            </div>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditingCourse ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Course Title</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-lg font-bold bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Platform Description</Label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Describe what this course covers..."
                        rows={3}
                        className="bg-background"
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
                        Commit Changes
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
                        Abort
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
                    <CardDescription className="text-foreground/70">
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
                    className="bg-background"
                  >
                    <PenLine className="h-4 w-4 mr-1" /> Override
                  </Button>
                  <Button
                    variant={course.published ? "outline" : "default"}
                    size="sm"
                    onClick={handleTogglePublish}
                    disabled={isSaving}
                    className={!course.published ? "shadow-lg shadow-primary/20" : "bg-background"}
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
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" /> Lessons Node
                </h2>
                <p className="text-xs text-muted-foreground">
                  {lessons.length} nodes integrated into this sequence.
                </p>
              </div>
              <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> Insert Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert Course Node</DialogTitle>
                    <DialogDescription>
                      Inject a new lesson into the content stream.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddLesson} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Node Title</Label>
                      <Input
                        placeholder="e.g. Protocol Overview"
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
                        Commit Node
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {lessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border/40 bg-muted/5 gap-3 text-center">
                <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-bold text-sm">Sequence Empty</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    No content nodes found for this course registration.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, idx) => {
                  const isExpanded = expandedLesson === lesson.id;
                  const edit = lessonEdits[lesson.id];
                  return (
                    <Card key={lesson.id} className="border-border/60 shadow-none hover:border-primary/30 transition-colors overflow-hidden group">
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() =>
                          setExpandedLesson(isExpanded ? null : lesson.id)
                        }
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab shrink-0 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-black text-primary/40 w-5 shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-bold flex-1 truncate">
                          {lesson.title}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        )}
                      </div>

                      {isExpanded && (
                        <CardContent className="border-t border-border/40 pt-6 space-y-4 bg-muted/5">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Node Heading</Label>
                            <Input
                                className="font-bold"
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
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Detailed Content</Label>
                            <Textarea
                              placeholder="Write course content payload..."
                              rows={10}
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
                              className="font-mono text-sm leading-relaxed"
                            />
                          </div>
                          <div className="flex justify-between pt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 font-bold"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              disabled={deletingId === lesson.id}
                            >
                              {deletingId === lesson.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Purge Node
                            </Button>
                            {edit && (
                              <Button
                                size="sm"
                                onClick={() => handleSaveLesson(lesson)}
                                className="shadow-lg shadow-primary/20"
                              >
                                <Save className="h-4 w-4 mr-2" /> Snapshot Content
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

        {/* Right Column: Platform Metadata */}
        <div className="space-y-6">
            <Card className="border-border/60 shadow-sm bg-muted/5 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                    <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                        <Info className="size-3" /> Infrastructure Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Instance ID</p>
                        <p className="text-xs font-mono font-bold bg-muted p-1 px-2 rounded-sm border border-border/40 overflow-hidden text-ellipsis whitespace-nowrap">COURSE_{course.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Origin Creator UID</p>
                        <p className="text-[10px] font-mono bg-muted p-1 px-2 rounded-sm border border-border/40 truncate">{course.creatorId}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Initialization</p>
                        <p className="text-xs font-bold">{new Date(course.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="pt-4 border-t border-border/40">
                         <div className="flex items-center justify-between text-[10px] uppercase font-black">
                            <span className="text-muted-foreground">Admin Status</span>
                            <span className="text-green-500 flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> AUTHORIZED
                            </span>
                         </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
                    <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="size-3 text-primary" /> Authority
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground italic mb-4">
                        You are editing this course as a Platform Super Admin. Changes made here bypass organization-level locks.
                    </p>
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full text-xs font-bold" asChild>
                            <Link href="/admin/logs">View Security Logs</Link>
                        </Button>
                        <Button variant="outline" className="w-full text-xs font-bold" asChild>
                            <Link href="/admin/users">Contact Creator</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
