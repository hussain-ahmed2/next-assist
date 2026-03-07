"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AdvancedTable } from "@/components/ui/advanced-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { actionDeleteCourse } from "@/actions/course.action";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type CourseRow = {
  id: number;
  title: string;
  description: string | null;
  published: boolean;
  createdAt: string;
};

export function CourseTable({ data: initialData }: { data: any[] }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isPending, startTrans] = useTransition();

  const handleDelete = (id: number, title: string) => {
    startTrans(async () => {
      try {
        const result = await actionDeleteCourse(id);
        if (result.success) {
          toast.success(`Course "${title}" deleted`);
          setData((prev) => prev.filter((c) => c.id !== id));
          router.refresh();
        } else {
          toast.error("Failed to delete course");
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const columns: ColumnDef<CourseRow>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Course Title",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.original.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
            {row.original.description || "No description"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.published
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-orange-500/10 text-orange-500 border-orange-500/20"
          }
        >
          {row.original.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <Link href={`/admin/courses/${row.original.id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Edit Content
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Delete Course
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{row.original.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this course and all its lessons. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => handleDelete(row.original.id, row.original.title)}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [isPending]);

  return (
    <AdvancedTable
      data={data}
      columns={columns}
      tabs={[{ value: "all", label: "Global Catalog" }]}
    />
  );
}
