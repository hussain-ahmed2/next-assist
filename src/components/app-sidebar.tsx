"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  BookOpen,
  Bot,
  Frame,
  Map as MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
  Building2,
  Zap,
  Briefcase,
  Crown,
  GraduationCap,
  School,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { type Organization } from "@/db/schema/organizations";
import { type User } from "@/db/schema/auth";
import { SessionUser } from "@/types/auth.types";

// This is sample data, updated to match the shadcn demo "site" style.
const data = {
  navMain: [
    {
      title: "Platform",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
        {
          title: "Organizations",
          url: "/admin/organizations",
        },
        {
          title: "Users",
          url: "/admin/users",
        },
      ],
    },
    {
      title: "Management",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "System Logs",
          url: "/admin/logs",
        },
        {
          title: "Settings",
          url: "/admin/settings",
        },
        {
          title: "Infrastructure",
          url: "#",
        },
      ],
    },
    {
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser;
  organizations?: Organization[];
}

export function AppSidebar({
  user,
  organizations = [],
  ...props
}: AppSidebarProps) {
  const role = user.role;

  const teams = useMemo(() => {
    const dbTeams = organizations.map((org) => {
      let Icon = Building2;
      if (org.isRoot) Icon = Zap;
      else if (org.type === "University" || org.type === "College") Icon = GraduationCap;
      else if (org.type === "School") Icon = School;
      else if (org.type === "Company") Icon = Briefcase;

      return {
        name: org.name,
        slug: org.slug,
        logo: Icon,
        plan: org.isRoot ? "Platform" : org.plan,
        isRoot: org.isRoot,
        type: org.type,
      };
    });

    // 2. Identify the primary platform entry using isRoot flag or fallback slug
    const platformEntry = dbTeams.find((t) => t.isRoot) || 
                         dbTeams.find((t) => t.slug === "nextassist") || {
      name: "NextAssist",
      slug: "nextassist",
      logo: Zap,
      plan: "Platform",
      isRoot: true,
      type: "Platform",
    };

    // 3. Return unique list with platform at the top, excluding the identity used as platform
    const otherTeams = dbTeams.filter((t) => t.slug !== platformEntry.slug);
    return [platformEntry, ...otherTeams];
  }, [organizations]);

  // Role-based navigation items
  const getNavItems = () => {
    if (role === "super_admin") {
      return [
        {
          title: "Platform",
          url: "#",
          icon: SquareTerminal,
          isActive: true,
          items: [
            { title: "Dashboard", url: "/admin/dashboard" },
            { title: "Organizations", url: "/admin/organizations" },
            { title: "Users", url: "/admin/users" },
          ],
        },
        {
          title: "Management",
          url: "#",
          icon: Bot,
          items: [
            { title: "System Logs", url: "/admin/logs" },
            { title: "Settings", url: "/admin/settings" },
          ],
        },
      ];
    }

    // Default for org_admin
    return [
      {
        title: "Organization",
        url: "#",
        icon: Building2,
        isActive: true,
        items: [
          { title: "Dashboard", url: "/dashboard" },
          { title: "Members", url: "/dashboard/members" },
        ],
      },
      {
        title: "Academics",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Courses", url: "/dashboard/courses" },
          { title: "Learning", url: "/learn" },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          { title: "General", url: "/dashboard/settings" },
          { title: "Billing & Plans", url: "#" },
        ],
      },
    ];
  };

  const dynamicData = {
    ...data,
    teams,
    user: {
      name: user.name,
      email: user.email,
      avatar:
        user.image ||
        `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.name)}`,
      role: (user.role as string | undefined) || undefined,
    },
    navMain: getNavItems(), // Use only the role-specific items
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {role === "super_admin" ? (
        <SidebarHeader>
          <TeamSwitcher
            teams={dynamicData.teams}
            canSwitch={true}
            canCreate={true}
          />
        </SidebarHeader>
      ) : (
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent active:bg-transparent">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={dynamicData.user.avatar}
                    alt={dynamicData.user.name}
                  />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                    {dynamicData.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{dynamicData.user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.org_slug || dynamicData.user.email}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent>
        <NavMain items={dynamicData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
