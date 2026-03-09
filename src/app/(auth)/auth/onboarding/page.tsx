import OnboardingWizard from "@/components/auth/onboarding-wizard";
import { Suspense } from "react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 flex flex-col justify-center items-center py-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center px-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-linear-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Scale your mentoring program.
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            B2B Onboarding for NextAssist Enterprise.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        }>
          <OnboardingWizard />
        </Suspense>

        <div className="flex justify-center items-center gap-8 opacity-40 grayscale pointer-events-none px-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6" />
        </div>
      </div>
    </div>
  );
}
