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
import { actionCheckSSO, actionGetSSOUrl } from "@/actions/org.action";
import { ShieldCheck, Mail, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { useEffect } from "react";

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
  const [ssoInfo, setSsoInfo] = useState<{ orgName: string; ssoProvider: string; ssoConfigured: boolean; slug: string } | null>(null);
  const [useSSO, setUseSSO] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const email = watch("email");

  useEffect(() => {
    const checkSSO = async () => {
      if (email && email.includes("@") && email.length > 5) {
        const result = (await actionCheckSSO(email)) as any;
        if (result.success && result.data?.ssoConfigured) {
          setSsoInfo(result.data);
          setUseSSO(true);
        } else {
          setSsoInfo(null);
          setUseSSO(false);
        }
      } else {
        setSsoInfo(null);
        setUseSSO(false);
      }
    };
    
  const timer = setTimeout(checkSSO, 200);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSSOClick = async () => {
    if (!email || !ssoInfo) return;
    setIsLoading(true);
    const result = (await actionGetSSOUrl(email)) as any;
    if (result.success && result.data?.url) {
      toast.success(`Redirecting to ${ssoInfo.orgName} Secure Portal...`);
      window.location.assign(result.data.url);
    } else {
      toast.error(result.message || "Failed to initiate SSO secure session");
      setIsLoading(false);
    }
  };

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
        {ssoInfo && useSSO && (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">{ssoInfo.orgName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Managed by {ssoInfo.ssoProvider}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" type="button" onClick={() => setUseSSO(false)} className="text-xs">
              Use Password
            </Button>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={isLoading}
              className="h-12 bg-muted/20 border-border focus:border-primary transition-all pl-10"
              {...register("email")}
            />
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-4" />
          </div>
          <FieldError errors={[errors.email]} />
        </Field>

        {(!useSSO || !ssoInfo) ? (
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                className="h-12 bg-muted/20 border-border focus:border-primary transition-all pl-10"
                {...register("password")}
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-4" />
            </div>
            <FieldError errors={[errors.password]} />
          </Field>
        ) : (
          <div className="p-6 bg-muted/10 rounded-2xl border border-dashed border-border text-center space-y-2">
            <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Password managed by your organization</p>
            <p className="text-xs text-muted-foreground">You will be redirected to {ssoInfo.orgName} identity portal.</p>
          </div>
        )}

        <Button
          type={useSSO ? "button" : "submit"}
          size="xl"
          className="w-full mt-4 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
          disabled={isLoading}
          onClick={useSSO ? handleSSOClick : undefined}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              {useSSO ? "Connecting..." : "Signing In..."}
            </>
          ) : useSSO ? (
            <>
              Login with {ssoInfo?.ssoProvider}
              <ExternalLink className="w-4 h-4 ml-2" />
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
