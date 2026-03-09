"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingData } from "@/validations/onboarding.validation";
import { submitOnboarding } from "@/actions/onboarding.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actionSendTestInvite } from "@/actions/org.action";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Building2, ShieldCheck, CreditCard, Users, Send, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Identity", icon: Users },
  { id: 2, title: "Verify", icon: ShieldCheck },
  { id: 3, title: "Organization", icon: Building2 },
  { id: 4, title: "Billing", icon: CreditCard },
  { id: 5, title: "Access", icon: Send },
  { id: 6, title: "Gatekeeping", icon: ShieldCheck },
  { id: 7, title: "Launch", icon: Rocket },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      memberType: "org_admin",
      isIomEnabled: true,
      ssoProvider: "none",
      planId: "Business",
    },
  });

  const nextStep = () => {
    if (currentStep === 1) {
      const email = form.getValues("email");
      const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
      const domain = email.split("@")[1];
      if (personalDomains.includes(domain)) {
        form.setError("email", { message: "Personal email providers (Gmail, Yahoo, etc.) are restricted. Please use your professional email." });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: OnboardingData) => {
    if (currentStep < STEPS.length) {
      nextStep();
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = (await submitOnboarding(data)) as any;
      if (result.success) {
        toast.success(result.data?.message || "Organization published successfully!");
        router.push("/dashboard"); 
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error("Submission failed. Check logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 group">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isActive ? "border-primary bg-primary/10 text-primary scale-110" : 
                  isCompleted ? "border-primary bg-primary text-white" : 
                  "border-muted bg-muted/20 text-muted"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden md:block",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <Card className="border-none shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {STEPS.find(s => s.id === currentStep)?.title}
          </CardTitle>
          <CardDescription>
            Complete your organization setup to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit) as any} className="space-y-6 pt-6">
            
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input {...form.register("name")} placeholder="John Smith" className="h-12" />
                    <FieldError errors={[form.formState.errors.name]} />
                  </Field>
                  <Field>
                    <FieldLabel>Professional Email</FieldLabel>
                    <Input {...form.register("email")} type="email" placeholder="john@acme.com" className="h-12" />
                    <FieldError errors={[form.formState.errors.email]} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input {...form.register("phone")} placeholder="+1 (555) 000-0000" className="h-12" />
                    <FieldError errors={[form.formState.errors.phone]} />
                  </Field>
                  <Field>
                    <FieldLabel>Organization Name</FieldLabel>
                    <Input {...form.register("organizationName")} placeholder="Acme Corp" className="h-12" />
                    <FieldError errors={[form.formState.errors.organizationName]} />
                  </Field>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-4">
                    We've sent a 6-digit verification code to <strong>{form.getValues("email")}</strong>. 
                    Please enter it below to verify your professional identity.
                  </p>
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Input 
                        key={i} 
                        className="w-12 h-14 text-center text-xl font-bold border-2 focus:border-primary" 
                        maxLength={1}
                      />
                    ))}
                  </div>
                  <Button type="button" onClick={nextStep} className="w-full">Verify Code</Button>
                  <Button variant="link" className="mt-4 text-primary">Resend Code</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Field>
                  <FieldLabel>Legal Entity Name</FieldLabel>
                  <Input {...form.register("legalName")} placeholder="Acme International LLC" className="h-12" />
                  <FieldError errors={[form.formState.errors.legalName]} />
                </Field>
                <Field>
                  <FieldLabel>Headquarters Address</FieldLabel>
                  <Input {...form.register("hqAddress")} placeholder="123 Silicon Valley Way, CA" className="h-12" />
                  <FieldError errors={[form.formState.errors.hqAddress]} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Tax ID (VAT/EIN)</FieldLabel>
                    <Input {...form.register("taxId")} placeholder="99-888888" className="h-12" />
                    <FieldError errors={[form.formState.errors.taxId]} />
                  </Field>
                  <Field>
                    <FieldLabel>Domain Whitelist</FieldLabel>
                    <Input placeholder="@acme.com" className="h-12" />
                    <FieldDescription>Email domains allowed to join automatically.</FieldDescription>
                  </Field>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-2 border-primary p-6 rounded-2xl bg-primary/5 cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-primary p-2 rounded-lg text-white">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Popular</span>
                    </div>
                    <h3 className="text-xl font-bold">Business</h3>
                    <p className="text-sm text-muted-foreground mb-4">Trial for 1 Year Activated.</p>
                    <div className="text-3xl font-bold mb-6">$0<span className="text-base font-normal text-muted-foreground">/first year</span></div>
                    <ul className="text-sm space-y-2 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Up to 500 seats (Promo)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Full Premium Analytics</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 24/7 Priority Support</li>
                    </ul>
                    <Button className="w-full">Start 1-Year Trial</Button>
                  </div>
                  <div className="border-2 border-transparent hover:border-border p-6 rounded-2xl bg-muted/20 cursor-pointer">
                    <div className="bg-muted p-2 rounded-lg mb-4 w-fit">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Enterprise</h3>
                    <p className="text-sm text-muted-foreground mb-4">Unlimited Trial for 1 Year.</p>
                    <div className="text-3xl font-bold mb-6">$0<span className="text-base font-normal text-muted-foreground">/first year</span></div>
                    <ul className="text-sm space-y-2 mb-6">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited everything</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Custom SLA</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Full SSO / SCIM Integration</li>
                    </ul>
                    <Button variant="outline" className="w-full">Start Enterprise Trial</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <Field>
                    <FieldLabel>Separate Billing Admin Email (Optional)</FieldLabel>
                    <Input {...form.register("billingAdminEmail")} type="email" placeholder="finance@acme.com" className="h-12" />
                    <FieldDescription>Billing admins see invoices but cannot access mentorship program data.</FieldDescription>
                  </Field>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-4">
                  {["Okta", "Azure AD", "Google"].map((prov) => (
                    <Button key={prov} variant="outline" className="h-20 flex flex-col gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      {prov}
                    </Button>
                  ))}
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-dashed text-center">
                  <p className="text-sm text-muted-foreground">Setup SAML or OIDC later in the Admin Dashboard.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between p-4 bg-background border rounded-2xl">
                  <div className="space-y-1">
                    <h4 className="font-bold">Invite-Only Mode (IOM)</h4>
                    <p className="text-sm text-muted-foreground">Only invited users can join via magic link or CSV.</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-background border rounded-2xl opacity-50 grayscale pointer-events-none">
                  <div className="space-y-1">
                    <h4 className="font-bold">Self-Service Mode</h4>
                    <p className="text-sm text-muted-foreground">Anyone with @company.com can join (requires approval).</p>
                  </div>
                  <div className="w-12 h-6 bg-muted rounded-full relative p-1">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1"></div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Ready for Launch!</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Audit Log Initialized</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { action: "Identity Created", time: "Just now", detail: form.getValues("name") },
                      { action: "Email Verified", time: "2 mins ago", detail: form.getValues("email") },
                      { action: "Org Identity Provisioned", time: "1 min ago", detail: form.getValues("organizationName") },
                      { action: "Plan selected", time: "1 min ago", detail: "Business (1-Year Trial)" },
                      { action: "Gatekeeping initialized", time: "Seconds ago", detail: "IOM: ON" },
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-primary/5 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-muted-foreground">({log.detail})</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-muted-foreground text-sm py-2">
                    All security protocols verified. Your organization dashboard is ready to be initialized.
                  </p>
                  
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full"
                        onClick={async () => {
                            const res = (await actionSendTestInvite(form.getValues("email"))) as any;
                            if(res.success) toast.success(res.data.message);
                            else toast.error(res.message);
                        }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Invite
                    </Button>
                    <Button size="lg" className="w-full" disabled={isLoading} type="submit">
                      {isLoading ? <Spinner /> : "Publish & Launch"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-8 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={prevStep} 
                disabled={currentStep === 1 || isLoading}
                className="hover:bg-primary/5"
              >
                Back
              </Button>
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep} size="lg" className="px-10 shadow-lg shadow-primary/20">
                  Next
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center text-xs text-muted-foreground mt-8">
        Securing enterprise data with PCI-compliant processing and Multi-tenant isolation.
      </p>
    </div>
  );
}
