import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { fetchAllUsers } from "@/actions/org.action";
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

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ org?: string }>;
}) {
    const { org } = await searchParams;
    const users = await fetchAllUsers(org);

    // Map to the format the table components expect
    const tableData: UserRow[] = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        org_slug: user.org_slug,
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        status: "Done" as const
    }));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Users</h1>
					<p className="text-muted-foreground text-sm">
						Manage platform users, roles, and access across every organization.
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="bg-linear-to-br from-primary/5 to-transparent border-primary/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Platform Accounts</CardTitle>
						<Users className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{users.length}</div>
						<p className="text-xs text-muted-foreground">Active user accounts</p>
					</CardContent>
				</Card>
			</div>

			<Card className="border-none shadow-none bg-transparent">
				<CardContent className="p-0">
                    <UserTable data={tableData} />
				</CardContent>
			</Card>
		</div>
	);
}
