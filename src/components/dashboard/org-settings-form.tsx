"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Save, Loader2, Info, GraduationCap, Briefcase, ShieldCheck, Mail, Lock, Sparkles, Globe } from "lucide-react";
import { actionUpdateOrgSettings } from "@/actions/org.action";
import { Switch } from "@/components/ui/switch";

export function OrgSettingsForm({ organization }: { organization: any }) {
    const [isPending, setIsPending] = useState(false);
    const [name, setName] = useState(organization.name);
    const [type, setType] = useState(organization.type || "Company");
    const [isIomEnabled, setIsIomEnabled] = useState(organization.isIomEnabled ?? true);
    const [ssoProvider, setSsoProvider] = useState(organization.ssoProvider || "none");
    const [ssoMetadata, setSsoMetadata] = useState(organization.ssoMetadata || "");
    const [ssoClientId, setSsoClientId] = useState(organization.ssoClientId || "");
    const [ssoClientSecret, setSsoClientSecret] = useState(organization.ssoClientSecret || "");
    const [ssoConfigured, setSsoConfigured] = useState(organization.ssoConfigured || false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        
        const result = (await actionUpdateOrgSettings({ 
            name, 
            type,
            isIomEnabled,
            ssoProvider,
            ssoMetadata,
            ssoClientId,
            ssoClientSecret,
            ssoConfigured: ssoProvider !== "none" && ssoMetadata.trim() !== "" && ssoClientId.trim() !== ""
        })) as any;

        if (result.success) {
            toast.success("Organization settings updated and verified");
            if (result.org) {
                setSsoConfigured(result.org.ssoConfigured);
            }
        } else {
            toast.error(result.message || "Failed to update settings");
        }
        
        setIsPending(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Organization Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your company profile, branding, and workspace type.
                    </p>
                </div>
                <Button type="submit" disabled={isPending} className="gap-2 shadow-lg shadow-primary/20">
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="border-border/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Building2 className="size-5 text-primary" />
                            General Profile
                        </CardTitle>
                        <CardDescription>
                            Your organization's visual identity on the platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input 
                                    id="name"
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Acme Corporation"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Organization Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Company">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="size-4 text-blue-500" />
                                                <span>Company / Studio</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="School">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="size-4 text-green-500" />
                                                <span>School / Academy</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="University">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="size-4 text-purple-500" />
                                                <span>University / College</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex gap-3 text-sm text-primary">
                            <Info className="size-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-bold">Pro Tip</p>
                                <p className="opacity-80">
                                    Changing your organization name updates your public profile and workspace branding immediately. Slugs can only be changed by platform admins.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShieldCheck className="size-5 text-indigo-500" />
                            Gatekeeping & SSO
                        </CardTitle>
                        <CardDescription>
                            Control how users join and authenticate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-8">
                        {/* Gatekeeping */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Lock className="size-4" />
                                Onboarding Mode
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-muted/20 border-2 rounded-2xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold">Invite-Only Mode (IOM)</h4>
                                        {isIomEnabled && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Only invited users can join via magic link or manual addition.</p>
                                </div>
                                <Switch checked={isIomEnabled} onCheckedChange={setIsIomEnabled} />
                            </div>
                        </div>

                        {/* SSO */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Globe className="size-4" />
                                Single Sign-On Configuration
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Identity Provider</Label>
                                    <Select value={ssoProvider} onValueChange={setSsoProvider}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select IDP" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Email Only)</SelectItem>
                                            <SelectItem value="okta">Okta (SAML/OIDC)</SelectItem>
                                            <SelectItem value="azure">Microsoft Azure AD</SelectItem>
                                            <SelectItem value="google">Google Workspace</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metadata">Metadata URL / Issuer</Label>
                                    <Input 
                                        id="metadata"
                                        placeholder="https://dev-xxx.auth0.com/"
                                        value={ssoMetadata}
                                        onChange={(e) => setSsoMetadata(e.target.value)}
                                        disabled={ssoProvider === "none"}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            {ssoProvider !== "none" && (
                                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="client-id">Client ID</Label>
                                        <Input 
                                            id="client-id"
                                            placeholder="Your OIDC Client ID"
                                            value={ssoClientId}
                                            onChange={(e) => setSsoClientId(e.target.value)}
                                            className="h-11 shadow-inner bg-muted/10 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client-secret">Client Secret</Label>
                                        <Input 
                                            id="client-secret"
                                            type="password"
                                            placeholder="••••••••••••••••"
                                            value={ssoClientSecret}
                                            onChange={(e) => setSsoClientSecret(e.target.value)}
                                            className="h-11 shadow-inner bg-muted/10"
                                        />
                                    </div>
                                </div>
                            )}
                            {ssoProvider !== "none" && !ssoConfigured && (
                                <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg flex items-center gap-2">
                                    <Info className="size-4" />
                                    Enter your Identity Provider metadata to enable SSO.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="size-5 text-amber-500" />
                            Subscription Details
                        </CardTitle>
                        <CardDescription>Your current tier and infrastructure limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-0">
                         <div className="flex items-center justify-between py-3 border-b border-border/50">
                            <span className="text-sm font-medium">Current Plan</span>
                             <Badge variant="outline" className="bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px] border-primary/20">
                                {organization.plan}
                            </Badge>
                         </div>
                         {organization.trialEndDate && (
                            <div className="flex items-center justify-between py-3 border-b border-border/50">
                                <span className="text-sm font-medium">Trial Ends</span>
                                <span className="text-sm font-semibold flex items-center gap-2 text-primary">
                                    {new Date(organization.trialEndDate).toLocaleDateString()}
                                    <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 whitespace-nowrap">Trial Active</Badge>
                                </span>
                            </div>
                         )}
                         <div className="flex items-center justify-between py-3 border-b border-border/50">
                            <span className="text-sm font-medium">Tenant Slug</span>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono font-bold">{organization.slug}</code>
                         </div>
                         <div className="flex items-center justify-between py-3">
                            <span className="text-sm font-medium">Provisioned At</span>
                            <span className="text-sm text-muted-foreground">
                                {new Date(organization.createdAt).toLocaleDateString()}
                            </span>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}

function Badge({ children, className, variant = "default" }: any) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
