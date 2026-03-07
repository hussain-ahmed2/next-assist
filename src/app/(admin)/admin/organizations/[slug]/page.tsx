import { notFound } from "next/navigation";
import { fetchAllOrganizations, fetchAllUsers } from "@/actions/org.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/admin/user-table";

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    org_slug: string | null;
    createdAt: string;
    status: "Done" | "In Progress" | "Not Started" | "Review";
};

export default async function OrganizationDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    
    // Fetch specifically this organization
    const orgs = await fetchAllOrganizations(slug);
    const org = orgs.find(o => o.slug === slug);
    
    if (!org) {
        notFound();
    }

    // Fetch users for this specific organization
    const users = await fetchAllUsers(slug);
    
    const tableData: UserRow[] = users.map(user => ({
        id: user.id || "unknown",
        name: user.name || "Unknown",
        email: user.email,
        role: user.role,
        org_slug: user.org_slug || null,
        createdAt: new Date(user.createdAt || Date.now()).toLocaleDateString(),
        status: "Done" as const
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage settings, members, and details for {org.name}.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-linear-to-br from-primary/5 to-transparent border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Active in this organization</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-linear-to-br from-secondary/5 to-transparent border-secondary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{org.plan}</div>
                        <p className="text-xs text-muted-foreground">Subscription tier</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Organization Members</h2>
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <UserTable data={tableData} orgSlug={slug} />
                </CardContent>
            </Card>
        </div>
    );
}
