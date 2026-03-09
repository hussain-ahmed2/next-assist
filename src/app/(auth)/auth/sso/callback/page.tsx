import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function SSOCallbackPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Verifying Identity</h1>
                    <p className="text-muted-foreground">Please wait while we securely process your organization credentials.</p>
                </div>
                
                <Suspense fallback={<Spinner />}>
                    <SSOProcessor />
                </Suspense>
            </div>
        </div>
    );
}

function SSOProcessor() {
    // In a real implementation, this component would:
    // 1. Grab the 'code' from URL search params
    // 2. Exchange it for a JWT token via a Server Action
    // 3. Authenticate the session using Better Auth
    return (
        <div className="mt-4 px-4 py-2 bg-muted rounded-full text-xs font-mono font-bold animate-pulse">
            Processing OIDC Handshake...
        </div>
    );
}
