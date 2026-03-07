"use client";

import { useState, useTransition, startTransition } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AdvancedTable, TableCellViewer } from "@/components/ui/advanced-table";
import { CreateOrgDialog } from "@/components/admin/create-org-dialog";
import { EditOrgDialog } from "@/components/admin/edit-org-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { adminDeleteOrganization } from "@/actions/org.action";
import { toast } from "sonner";

type OrganizationRow = {
  id: number;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
  status: "Done" | "In Progress" | "Not Started" | "Review";
};

const columns: ColumnDef<OrganizationRow>[] = [
  {
    accessorKey: "name",
    header: "Organization Name",
    id: "name",
    cell: ({ row }) => (
      <TableCellViewer header={row.original.name} item={row.original} />
    ),
  },
  {
    accessorKey: "slug",
    header: "Unique Slug",
    cell: ({ row }) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: "plan",
    header: "Subscription",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-secondary/50 text-secondary-foreground">
        {row.original.plan}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
  },
  {
    accessorKey: "status",
    header: "Schema Status",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
        {row.original.status === "Done" ? "ACTIVE (V1)" : "PROVISIONING"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <EditOrgDialog 
              organization={row.original} 
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit settings
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem className="text-destructive">
              Delete organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export function OrganizationTable({ data: initialData }: { data: OrganizationRow[] }) {
  "use no memo";
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isPending, startTrans] = useTransition();

  const handleDelete = (id: number, name: string) => {
    startTrans(async () => {
      try {
        const result = await adminDeleteOrganization(id);
        if (result.success) {
          toast.success(`"${name}" deleted successfully`);
          setData((prev) => prev.filter((o) => o.id !== id));
          startTransition(() => router.refresh());
        } else {
          toast.error(result.message || "Failed to delete");
        }
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  };

  const columns: ColumnDef<OrganizationRow>[] = [
    {
      accessorKey: "name",
      header: "Organization Name",
      id: "name",
      cell: ({ row }) => (
        <TableCellViewer header={row.original.name} item={row.original} />
      ),
    },
    {
      accessorKey: "slug",
      header: "Unique Slug",
      cell: ({ row }) => (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "plan",
      header: "Subscription",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-secondary/50 text-secondary-foreground">
          {row.original.plan}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
    },
    {
      accessorKey: "status",
      header: "Schema Status",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
          {row.original.status === "Done" ? "ACTIVE (V1)" : "PROVISIONING"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <EditOrgDialog
                organization={row.original}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit settings
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Delete organization
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{row.original.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the organization and disassociate all its members. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => handleDelete(row.original.id, row.original.name)}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <AdvancedTable
      data={data}
      columns={columns}
      extraActions={<CreateOrgDialog />}
    />
  );
}
