"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Globe, ShieldCheck, Mail, Settings2 } from "lucide-react";
import { actionUpdateSiteConfig } from "@/actions/site.action";

export function SettingsForm({ initialConfig }: { initialConfig: any }) {
	const [isPending, setIsPending] = useState(false);
	const [config, setConfig] = useState(initialConfig);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsPending(true);
		
		const result = await actionUpdateSiteConfig({
			platformName: config.platformName,
			supportEmail: config.supportEmail,
			isRegistrationEnabled: config.isRegistrationEnabled,
			maintenanceMode: config.maintenanceMode,
		});

		if (result.success) {
			toast.success("Platform settings updated successfully");
		} else {
			toast.error(result.message || "Failed to update settings");
		}
		
		setIsPending(false);
	};

	return (
		<form onSubmit={handleSave} className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-black tracking-tighter">System Settings</h1>
					<p className="text-muted-foreground">
						Configure core platform parameters and infrastructure defaults.
					</p>
				</div>
				<Button type="submit" disabled={isPending} className="gap-2 shadow-lg shadow-primary/20">
					{isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
					Save All Changes
				</Button>
			</div>

			<div className="grid gap-6">
				<Card className="border-border/60 shadow-sm">
					<CardHeader className="bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Globe className="size-5 text-primary" />
							Platform Identity
						</CardTitle>
						<CardDescription>
							White-label parameters used across the multi-tenant landscape.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="platformName">Platform Brand Name</Label>
								<div className="relative">
									<Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input 
										id="platformName"
										className="pl-10"
										value={config.platformName} 
										onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
										placeholder="e.g. NextAssist"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="supportEmail">Global Support Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input 
										id="supportEmail"
										className="pl-10"
										type="email"
										value={config.supportEmail} 
										onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
										placeholder="support@example.com"
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm">
					<CardHeader className="bg-muted/30 pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<ShieldCheck className="size-5 text-primary" />
							Access & Registration
						</CardTitle>
						<CardDescription>
							Control how users and organizations interface with the platform.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 space-y-6">
						<div className="flex items-center justify-between space-x-2">
							<div className="space-y-0.5">
								<Label className="text-base">Public Registration</Label>
								<p className="text-sm text-muted-foreground">
									Allow new users to create accounts without an invitation.
								</p>
							</div>
							<Switch 
								checked={config.isRegistrationEnabled}
								onCheckedChange={(val: boolean) => setConfig({ ...config, isRegistrationEnabled: val })}
							/>
						</div>
						<div className="flex items-center justify-between space-x-2">
							<div className="space-y-0.5">
								<Label className="text-base text-destructive">Maintenance Mode</Label>
								<p className="text-sm text-muted-foreground">
									Disable all non-admin access to the platform for backend upgrades.
								</p>
							</div>
							<Switch 
								checked={config.maintenanceMode}
								onCheckedChange={(val: boolean) => setConfig({ ...config, maintenanceMode: val })}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</form>
	);
}
