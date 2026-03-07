"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpSchema } from "@/validations/auth.validation";
import { signUp } from "@/actions/auth.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/admin",
  org_admin:   "/dashboard",
  expert:      "/workspace",
  member:      "/learn",
  user:        "/pending",
};

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpSchema) => {
    setIsLoading(true);

    const result = await signUp(data);

    if (result.success) {
      toast.success("Account created successfully!");
      router.refresh();
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            placeholder="John Doe"
            disabled={isLoading}
            className="h-12 bg-muted/20 border-border focus:border-primary transition-all "
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={isLoading}
            className="h-12 bg-muted/20 border-border focus:border-primary transition-all "
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              className="h-12 bg-muted/20 border-border focus:border-primary transition-all "
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              disabled={isLoading}
              className="h-12 bg-muted/20 border-border focus:border-primary transition-all "
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full mt-4 shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  );
}
