"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { AdvancedTable } from "@/components/ui/advanced-table";
import { InviteMemberDialog } from "@/components/dashboard/invite-member-dialog";
import {
  CheckCircle2,
  MoreHorizontal,
  XCircle,
  Shield,
  GraduationCap,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { acceptUserToOrg, denyUserFromOrg } from "@/actions/org.action";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt: string | Date;
}

export default function MembersList({
  initialMembers,
  currentUserId,
}: {
  initialMembers: Member[];
  currentUserId: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [isPending, startTransition] = useTransition();

  const handleAccept = (userId: string) => {
    startTransition(async () => {
      try {
        const result = await acceptUserToOrg(userId, "member");
        if (result.success) {
          toast.success("Member approved successfully");
          // Optimistic update
          setMembers((prev) =>
            prev.map((m) => (m.id === userId ? { ...m, role: "member" } : m)),
          );
        }
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  };

  const handleDeny = (userId: string) => {
    startTransition(async () => {
      try {
        const result = await denyUserFromOrg(userId);
        if (result.success) {
          toast.success("Member request denied");
          // Optimistic update: completely remove from active members list
          setMembers((prev) => prev.filter((m) => m.id !== userId));
        }
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  };

  const handleRemove = (userId: string) => {
    startTransition(async () => {
      try {
        const result = await denyUserFromOrg(userId);
        if (result.success) {
          toast.success("Member removed from organization");
          setMembers((prev) => prev.filter((m) => m.id !== userId));
        }
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  };

  const handleChangeRole = (userId: string, newRole: "member" | "expert" | "org_admin") => {
    startTransition(async () => {
      try {
        const result = await acceptUserToOrg(userId, newRole);
        if (result.success) {
          toast.success(`Role updated successfully to ${newRole}`);
          setMembers((prev) =>
            prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)),
          );
        }
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  };

  const pending = members.filter((m) => m.role === "user");
  const active = members.filter((m) => m.role !== "user");

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "org_admin":
        return <Shield className="h-3 w-3 mr-1" />;
      case "expert":
        return <GraduationCap className="h-3 w-3 mr-1" />;
      default:
        return <UserIcon className="h-3 w-3 mr-1" />;
    }
  };

  const activeColumns: ColumnDef<Member>[] = [
    {
      accessorKey: "image",
      header: "Avatar",
      cell: ({ row }) => (
        <Avatar className="h-9 w-9">
          <AvatarImage src={row.original.image || undefined} />
          <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "name",
      header: "Member Details",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-full py-0.5 px-2 bg-muted/50">
          {getRoleIcon(row.original.role)}
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        if (row.original.id === currentUserId) return null;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border bg-background">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert("Profile View coming soon!")}>View Profile</DropdownMenuItem>
                {row.original.role !== "expert" && (
                  <DropdownMenuItem onClick={() => handleChangeRole(row.original.id, "expert")}>
                    Make Expert
                  </DropdownMenuItem>
                )}
                {row.original.role !== "member" && (
                  <DropdownMenuItem onClick={() => handleChangeRole(row.original.id, "member")}>
                    Make Member
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive font-medium" 
                  onClick={() => handleRemove(row.original.id)}
                >
                  Remove from Org
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-10">
      {/* Pending Invitations */}
      {pending.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight">
              Pending Approvals
            </h2>
            <Badge variant="secondary" className="rounded-full">
              {pending.length}
            </Badge>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
            <Table>
              <TableBody>
                {pending.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-primary/10 border-primary/10 transition-colors"
                  >
                    <TableCell className="w-12">
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeny(user.id)}
                          disabled={isPending}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Deny
                        </Button>
                        <Button
                          size="sm"
                          
                          onClick={() => handleAccept(user.id)}
                          disabled={isPending}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Active Members */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Active Members</h2>
        </div>

        <AdvancedTable 
          data={active} 
          columns={activeColumns} 
          extraActions={<InviteMemberDialog />}
        />
      </section>
    </div>
  );
}
