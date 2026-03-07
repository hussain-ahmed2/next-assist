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
import { Building2, Save, Loader2, Info, GraduationCap, Briefcase } from "lucide-react";
import { actionUpdateOrgSettings } from "@/actions/org.action";

export function OrgSettingsForm({ organization }: { organization: any }) {
    const [isPending, setIsPending] = useState(false);
    const [name, setName] = useState(organization.name);
    const [type, setType] = useState(organization.type || "Company");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        
        const result = await actionUpdateOrgSettings({ name, type });

        if (result.success) {
            toast.success("Organization settings updated");
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

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Subscription Details</CardTitle>
                        <CardDescription>Your current tier and infrastructure limits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm font-medium">Current Plan</span>
                             <Badge variant="outline" className="bg-secondary/50 font-bold uppercase tracking-wider text-[10px]">
                                {organization.plan}
                            </Badge>
                         </div>
                         <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm font-medium">Tenant Slug</span>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{organization.slug}</code>
                         </div>
                         <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium">Provisioned At</span>
                            <span className="text-xs text-muted-foreground">
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
