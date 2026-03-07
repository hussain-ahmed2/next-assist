import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { fetchAllOrganizations } from "@/actions/org.action";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Additional server-side security layer for the (admin) route group
  if (!session || session.user.role !== "super_admin") {
    redirect("/auth/sign-in");
  }

  const organizations = await fetchAllOrganizations();

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} organizations={organizations} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 font-medium">
            Super Admin Console
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
