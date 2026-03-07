"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Save, ShieldCheck, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
					<p className="text-muted-foreground">
						Configure core NextAssist infrastructure and platform defaults.
					</p>
				</div>
				<Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
					<Save className="size-4" />
					Save All
				</Button>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="size-5 text-primary" />
							Platform Identity
						</CardTitle>
						<CardDescription>
							Manage your white-label platform name and global SEO settings.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label className="text-sm font-medium">Platform Name</label>
								<Input defaultValue="NextAssist" />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Support Email</label>
								<Input defaultValue="support@nextassist.com" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShieldCheck className="size-5 text-primary" />
							Security & Authentication
						</CardTitle>
						<CardDescription>
							Enforce global security policies and MFA requirements.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 border rounded-lg bg-muted/20 text-sm text-muted-foreground italic">
							Standard password policies are currently managed by Better Auth.
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
