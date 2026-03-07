import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ShieldCheck, Zap } from "lucide-react";
import { fetchAllOrganizations, fetchAllUsers } from "@/actions/org.action";

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ org?: string }>;
}) {
    const { org } = await searchParams;
    const [orgs, users] = await Promise.all([
        fetchAllOrganizations(org),
        fetchAllUsers(org)
    ]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
				<p className="text-muted-foreground">
					Welcome back, Super Admin. Here is what is happening across your platform.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orgs.length}</div>
						<p className="text-xs text-muted-foreground">Across the platform</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{users.length}</div>
						<p className="text-xs text-muted-foreground">Registered accounts</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
						<Zap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orgs.length}</div>
						<p className="text-xs text-muted-foreground">Active org schemas</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
						<ShieldCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">System secure</p>
					</CardContent>
				</Card>
			</div>
			
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Recent Organizations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
                            {orgs.slice(0, 5).map(org => (
                                <div key={org.id} className="flex items-center gap-4">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{org.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {org.slug}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(org.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {orgs.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                    No organizations created yet.
                                </div>
                            )}
						</div>
					</CardContent>
				</Card>
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Platform Health</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Authentication Service</span>
                                <span className="ml-auto text-xs text-muted-foreground font-mono">ONLINE</span>
                            </div>
							<div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Database (PostgreSQL)</span>
                                <span className="ml-auto text-xs text-muted-foreground font-mono">ONLINE</span>
                            </div>
							<div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Schema Provisioner</span>
                                <span className="ml-auto text-xs text-muted-foreground font-mono">IDLE</span>
                            </div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
