import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2 } from "lucide-react";

export default function OrgSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your organization's preferences, branding, and rules.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center space-x-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Settings2 className="size-5" />
                        </div>
                        <div>
                            <CardTitle>General Profile</CardTitle>
                            <CardDescription>
                                Update your organization name, slug, and logos. 
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            (Settings form coming soon)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
