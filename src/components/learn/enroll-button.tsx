"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { actionEnrollMember } from "@/actions/course.action";
import { toast } from "sonner";
import { Loader2, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function EnrollButton({ courseId }: { courseId: number }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setIsPending(true);
    try {
      const result = await actionEnrollMember(courseId);
      if (result.success) {
        toast.success("Enrolled successfully!");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to enroll");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleEnroll}
      disabled={isPending}
      className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-xl shadow-primary/20"
    >
      {isPending ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <>
          <PlayCircle className="size-6" /> Begin Learning
        </>
      )}
    </Button>
  );
}
