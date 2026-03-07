"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CreateOrgDialog } from "@/components/admin/create-org-dialog"

export function TeamSwitcher({
  teams,
  canSwitch = true,
  canCreate = true,
}: {
  teams: {
    name: string
    slug: string
    logo: React.ElementType
    plan: string
    isRoot?: boolean
    type?: string
  }[]
  canSwitch?: boolean
  canCreate?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  // Initialize active team from URL slug
  const activeTeam = React.useMemo(() => {
    // Extract slug from path like /admin/organizations/some-slug
    const match = pathname.match(/\/admin\/organizations\/([^/]+)/);
    if (match && match[1]) {
      const orgSlug = match[1];
      return teams.find((t) => t.slug === orgSlug) || teams[0]
    }
    return teams[0]
  }, [pathname, teams])

  const onTeamSelect = (team: (typeof teams)[0]) => {
    if (team.isRoot) {
      router.push(`/admin/organizations`)
    } else {
      router.push(`/admin/organizations/${team.slug}`)
    }
  }

  if (!activeTeam) {
    return null
  }

  // For org admins: show a simple static display, no switching
  if (!canSwitch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <activeTeam.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Platform
            </DropdownMenuLabel>
            {teams
              .filter((t) => t.isRoot)
              .map((team, index) => (
                <DropdownMenuItem
                  key={team.slug}
                  onClick={() => onTeamSelect(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {teams
              .filter((t) => !t.isRoot)
              .map((team, index) => (
                <DropdownMenuItem
                  key={team.slug}
                  onClick={() => onTeamSelect(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>
                    ⌘{teams.filter((t) => t.isRoot).length + index + 1}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            {canCreate && (
              <CreateOrgDialog
                trigger={
                  <DropdownMenuItem
                    className="gap-2 p-2 focus:bg-primary/10 focus:text-primary cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Add organization
                    </div>
                  </DropdownMenuItem>
                }
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
