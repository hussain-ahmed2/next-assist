"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  CreateUserSchema,
} from "@/validations/admin.validation";
import { adminCreateUser, fetchAllOrganizations } from "@/actions/org.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
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
import { Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

export function CreateUserDialog({ defaultOrgSlug }: { defaultOrgSlug?: string } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [orgs, setOrgs] = useState<{ name: string; slug: string }[]>([]);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAllOrganizations().then((data: any) => {
        if (Array.isArray(data)) {
          setOrgs(data);
        }
      });
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      org_slug: defaultOrgSlug || "",
    },
  });

  const onSubmit = async (data: CreateUserSchema) => {
    setIsPending(true);
    try {
      const result = await adminCreateUser(data);
      if (result.success) {
        toast.success(`User "${data.name}" created successfully!`);
        setOpen(false);
        reset();
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.message || "Failed to create user");
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
        <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="size-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Create a new user and assign them a role and organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Field>
            <FieldLabel>Full Name</FieldLabel>
            <FieldContent>
              <Input
                {...register("name")}
                placeholder="e.g. John Doe"
                disabled={isPending}
              />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Email Address</FieldLabel>
            <FieldContent>
              <Input
                {...register("email")}
                placeholder="e.g. john@example.com"
                disabled={isPending}
              />
              <FieldError errors={[errors.email]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldContent>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                disabled={isPending}
              />
              <FieldError errors={[errors.password]} />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Role</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                        <SelectItem value="org_admin">Org Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.role]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Organization</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="org_slug"
                  render={({ field }) => (
                    <Popover
                      open={isOrgPopoverOpen}
                      onOpenChange={setIsOrgPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isPending || !!defaultOrgSlug}
                        >
                          <span className="truncate">
                            {field.value
                              ? orgs.find((org) => org.slug === field.value)
                                  ?.name
                              : "Select organization"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                        <Command>
                          <CommandInput placeholder="Search organization..." />
                          <CommandList>
                            <CommandEmpty>No organization found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="None (Platform)"
                                onSelect={() => {
                                  field.onChange("");
                                  setIsOrgPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === ""
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                None (Platform)
                              </CommandItem>
                              {orgs.map((org) => (
                                <CommandItem
                                  key={org.slug}
                                  value={org.name}
                                  onSelect={() => {
                                    field.onChange(org.slug);
                                    setIsOrgPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === org.slug
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {org.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError errors={[errors.org_slug]} />
              </FieldContent>
            </Field>
          </div>

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
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
