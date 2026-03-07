import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Side: Branding/Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/10 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20"></div>
        <Link
          href="/"
          className="flex items-center gap-2 relative z-10 transition-transform hover:scale-105 active:scale-95 duration-200"
        >
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl tracking-tight">NextAssist</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight mb-6">
            The future of enterprise learning is{" "}
            <span className="text-primary italic">isolated</span>.
          </h2>
          <p className="text-xl text-muted-foreground">
            Join the world's most advanced organizations building their learning
            infrastructure on NextAssist.
          </p>
        </div>

        <div className="text-sm text-muted-foreground relative z-10">
          © 2024 NextAssist Inc. Trusted identity by Better-Auth.
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex justify-center mb-8">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
