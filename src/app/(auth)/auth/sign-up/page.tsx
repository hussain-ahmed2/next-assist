import SignUpForm from "@/components/auth/signup-form";
import Link from "next/link";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Join our premium learning network.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-48 w-full animate-pulse bg-muted rounded-xl" />
        }
      >
        <SignUpForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
