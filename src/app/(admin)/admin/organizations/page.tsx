import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { fetchAllOrganizations } from "@/actions/org.action";
import { OrganizationTable } from "@/components/admin/org-table";

type OrganizationRow = {
    id: number;
    name: string;
    slug: string;
    plan: string;
    createdAt: string;
    status: "Done" | "In Progress" | "Not Started" | "Review";
};

export default async function OrganizationsPage({
    searchParams,
}: {
    searchParams: Promise<{ org?: string }>;
}) {
    const { org } = await searchParams;
    const orgs = await fetchAllOrganizations(org);
    
    // Map to the format the table components expect
    const tableData: OrganizationRow[] = orgs.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        createdAt: new Date(org.createdAt).toLocaleDateString(),
        status: "Done" as const
    }));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
					<p className="text-muted-foreground text-sm">
						Full control over company identity and multi-tenant infrastructure.
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="bg-linear-to-br from-primary/5 to-transparent border-primary/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Environments</CardTitle>
						<Building2 className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orgs.length}</div>
						<p className="text-xs text-muted-foreground">Provisioned successfully</p>
					</CardContent>
				</Card>
			</div>

			<Card className="border-none shadow-none bg-transparent">
				<CardContent className="p-0">
                    <OrganizationTable data={tableData} />
				</CardContent>
			</Card>
		</div>
	);
}
