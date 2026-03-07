"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateOrgSchema,
  UpdateOrgSchema,
} from "@/validations/admin.validation";
import { adminUpdateOrganization } from "@/actions/org.action";
import { toast } from "sonner";
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
import { Pencil, Loader2 } from "lucide-react";
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

export function EditOrgDialog({ organization, trigger }: { organization: any; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateOrgSchema>({
    resolver: zodResolver(updateOrgSchema),
    defaultValues: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      plan: organization.plan || "Free",
    },
  });

  const onSubmit = async (data: UpdateOrgSchema) => {
    setIsPending(true);
    try {
      const result = await adminUpdateOrganization(organization.id, {
        name: data.name,
        slug: data.slug,
        plan: data.plan,
      });
      if (result.success) {
        toast.success(`Organization "${data.name}" updated successfully!`);
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to update organization");
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update company name, unique slug, and subscription plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Field>
            <FieldLabel>Organization Name</FieldLabel>
            <FieldContent>
              <Input
                {...register("name")}
                placeholder="e.g. Acme Corp"
                disabled={isPending}
              />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Unique Slug</FieldLabel>
            <FieldContent>
              <Input
                {...register("slug")}
                placeholder="e.g. acme-corp"
                disabled={isPending}
              />
              <FieldError errors={[errors.slug]} />
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
                      <SelectItem value="Free">Free (Standard)</SelectItem>
                      <SelectItem value="Startup">Startup (Growth)</SelectItem>
                      <SelectItem value="Enterprise">Enterprise (Scale)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.plan]} />
            </FieldContent>
          </Field>

          <DialogFooter className="pt-4">
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
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
