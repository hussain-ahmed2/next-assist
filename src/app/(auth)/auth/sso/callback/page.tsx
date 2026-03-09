"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { actionExchangeSSOCode } from "@/actions/org.action";
import { toast } from "sonner";
import { Suspense } from "react";

export default function SSOCallbackPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Suspense fallback={<LoadingState message="Initializing..." />}>
                <SSOProcessor />
            </Suspense>
        </div>
    );
}

function SSOProcessor() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    const [message, setMessage] = useState("Processing OIDC Handshake...");

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
            setStatus("error");
            setMessage("Invalid callback parameters. No authorization code found.");
            return;
        }

        const verify = async () => {
            try {
                const result = (await actionExchangeSSOCode(code, state)) as any;
                
                if (result.success) {
                    setStatus("success");
                    setMessage(result.data.message || "Identity Verified!");
                    toast.success(result.data.message);
                    
                    // In a real app, the session is already set here
                    // We'll redirect to a protected route
                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 2000);
                } else {
                    setStatus("error");
                    setMessage(result.message || "SSO Verification Failed.");
                    toast.error(result.message);
                }
            } catch (err: any) {
                setStatus("error");
                setMessage(`Handshake Error: ${err.message}`);
            }
        };

        verify();
    }, [searchParams, router]);

    return (
        <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 flex flex-col items-center gap-4 text-center max-w-sm w-full mx-auto animate-in fade-in zoom-in duration-500">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                status === "processing" ? "bg-primary/10" : 
                status === "success" ? "bg-emerald-500/10" : "bg-destructive/10"
            }`}>
                {status === "processing" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
                {status === "success" && <ShieldCheck className="w-8 h-8 text-emerald-500 animate-bounce" />}
                {status === "error" && <XCircle className="w-8 h-8 text-destructive animate-pulse" />}
            </div>
            
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {status === "processing" ? "Verifying Identity" : 
                     status === "success" ? "Access Granted" : "Verification Failed"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">{message}</p>
            </div>

            {status === "success" && (
                <div className="w-full h-1 bg-emerald-500/10 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-emerald-500 animate-progress-fast" style={{ width: '100%' }}></div>
                </div>
            )}

            {status === "error" && (
                <button 
                    onClick={() => router.push("/auth/sign-in")}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    Back to Sign In
                </button>
            )}
        </div>
    );
}

function LoadingState({ message }: { message: string }) {
    return (
        <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    );
}
