"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrgSchema,
  CreateOrgSchema,
} from "@/validations/admin.validation";
import { adminCreateOrganization } from "@/actions/org.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateOrgDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateOrgSchema>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      slug: "",
      adminEmail: "",
      plan: "Free",
    },
  });

  const onSubmit = async (data: CreateOrgSchema) => {
    setIsPending(true);
    try {
      const result = await adminCreateOrganization(
        data.name,
        data.slug,
        data.adminEmail,
        data.plan,
      );
      if (result.success) {
        toast.success(`Organization "${data.name}" created successfully!`);
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create organization");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="size-4" />
            Create Org
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Provision a new organization and its dedicated database schema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <Field>
            <FieldLabel>Organization Name</FieldLabel>
            <FieldContent>
              <Input
                {...register("name")}
                placeholder="e.g. Acme Corporation"
                disabled={isPending}
              />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Organization Slug</FieldLabel>
            <FieldContent>
              <Input
                {...register("slug")}
                placeholder="e.g. acme-corp"
                disabled={isPending}
              />
              <DialogDescription className="text-[10px] mt-1">
                This will be used for the database schema name.
              </DialogDescription>
              <FieldError errors={[errors.slug]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Admin Email</FieldLabel>
            <FieldContent>
              <Input
                {...register("adminEmail")}
                placeholder="admin@acme.com"
                disabled={isPending}
              />
              <DialogDescription className="text-[10px] mt-1">
                The user must already be registered on the platform.
              </DialogDescription>
              <FieldError errors={[errors.adminEmail]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Subscription Plan</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="plan"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.plan]} />
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
