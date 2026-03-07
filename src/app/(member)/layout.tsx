import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MemberLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session || (session.user.role !== "member" && session.user.role !== "user" && session.user.role !== "super_admin")) {
		redirect("/auth/sign-in");
	}

	return (
		<SidebarProvider>
			<AppSidebar user={session.user} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<div className="flex items-center gap-2 font-medium">
						Learn Console / {session.user.org_slug || "Platform"}
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
