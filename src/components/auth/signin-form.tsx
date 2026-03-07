"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInSchema } from "@/validations/auth.validation";
import { signIn } from "@/actions/auth.action";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import Link from "next/link";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/admin",
  org_admin:   "/dashboard",
  expert:      "/workspace",
  member:      "/learn",
  user:        "/pending",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInSchema) => {
    setIsLoading(true);
    const result = await signIn(data);

    if (result.success) {
      toast.success("Welcome back!");
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

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            className="h-12 bg-muted/20 border-border focus:border-primary transition-all "
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Button
          type="submit"
          size="xl"
          className="w-full mt-4 shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
