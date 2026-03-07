import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Zap,
  Globe,
  Users,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              NextAssist<span className="text-primary">.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#solutions"
              className="hover:text-foreground transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/sign-in">Log in</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium bg-muted/30 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Trusted by 500+ Organizations
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto balance animate-in fade-in slide-in-from-bottom-8 duration-700">
            The Learning OS for{" "}
            <span className="text-primary italic">Modern Teams</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Deploy a fully isolated, white-labeled learning platform for your
            organization in seconds. Multi-tenancy that actually works.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Button size="xl" className="px-8" asChild>
              <Link href="/auth/sign-up">
                Start Building for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="px-8">
              View Demo
            </Button>
          </div>
        </div>

        {/* Twitter-style Bordered Card Presentation */}
        <div className="mt-20 max-w-5xl mx-auto px-4 perspective-1000">
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="aspect-video bg-muted/20 flex items-center justify-center text-muted-foreground p-1">
              {/* Placeholder for a preview or dashboard mockup */}
              <div className="w-full h-full border border-dashed border-border rounded-xl flex items-center justify-center bg-background/50">
                Dashboard Preview Mockup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 border-t border-border bg-muted/5"
      >
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything your org needs.
            </h2>
            <p className="text-muted-foreground">
              Powering growth through isolated education.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Data Isolation",
                desc: "Each organization gets its own dedicated Postgres schema. Your data never mixes.",
              },
              {
                icon: Globe,
                title: "White Labeling",
                desc: "Custom domains and branding for every tenant. It looks like your app, not ours.",
              },
              {
                icon: Users,
                title: "Role-Based Access",
                desc: "Integrated Super Admin, Org Admin, Expert, and Member roles out of the box.",
              },
              {
                icon: Zap,
                title: "B2B First",
                desc: "Built from the ground up for B2B SaaS architecture. Scalable from day one.",
              },
              {
                icon: BookOpen,
                title: "Rich Learning",
                desc: "Interactive courses, assessments, and progress tracking for all members.",
              },
              {
                icon: Zap,
                title: "Better Auth",
                desc: "Powered by Better-Auth for industrial-grade security and session management.",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-8 bg-background border-border hover:border-primary/50 transition-colors group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-border bg-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20"></div>
            <h2 className="text-4xl font-bold mb-6 relative z-10 transition-transform">
              Ready to revolutionize your team?
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto relative z-10">
              Join hundreds of companies building their internal and external
              learning platforms on NextAssist.
            </p>
            <Button size="xl" className="px-10 relative z-10">
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">NextAssist</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 NextAssist Inc. Built on the X/Twitter Aesthetic.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
