import { SignInForm } from "@/components/auth/signin-form";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your organization.
        </p>
      </div>

      <SignInForm />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
