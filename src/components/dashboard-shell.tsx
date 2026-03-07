"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Zap,
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-24 xl:w-72 border-r border-border flex flex-col p-4 xl:p-6 bg-background/50 backdrop-blur-sm z-50">
        <Link
          href="/dashboard"
         className="flex items-center gap-3 mb-10 xl:px-4"
        >
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="hidden xl:block text-2xl font-black tracking-tighter">
            Assist<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
             className={cn(
                "flex items-center gap-4 p-3 rounded-full transition-all group",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
               className={cn(
                  "h-7 w-7",
                  pathname === item.href ? "fill-primary/20" : "",
                )}
              />
              <span className="hidden xl:block text-xl">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <Button
            variant="ghost"
            
            onClick={handleSignOut}
           className="w-fit xl:w-full flex items-center gap-4 p-3 xl:px-4 h-auto hover:bg-destructive/10 hover:text-destructive group"
          >
            <LogOut className="h-7 w-7" />
            <span className="hidden xl:block text-xl">Log out</span>
          </Button>

          <div className="xl:p-4 rounded-2xl bg-muted/20 border border-border hidden xl:block">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-tr from-primary to-blue-400" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm truncate">User Profile</p>
                <p className="text-xs text-muted-foreground truncate">
                  org-admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-24 xl:ml-72 min-h-screen bg-background">
        {/* Top Header */}
        <header className="sticky top-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 px-6 flex items-center justify-between">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses or members..."
             className="w-full bg-muted/30 border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              
             className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-muted md:hidden" />
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
