"use client";

import { useState, useTransition, startTransition } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AdvancedTable, TableCellViewer } from "@/components/ui/advanced-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
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
import { adminDeleteUser } from "@/actions/org.action";
import { toast } from "sonner";

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    org_slug: string | null;
    createdAt: string;
    status: "Done" | "In Progress" | "Not Started" | "Review";
};

const columns: ColumnDef<UserRow>[] = [
    {
        accessorKey: "name",
        header: "Full Name",
        id: "name",
        cell: ({ row }) => (
            <TableCellViewer header={row.original.name} item={row.original} />
        ),
    },
    {
        accessorKey: "email",
        header: "Email Address",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
        accessorKey: "role",
        header: "Platform Role",
        cell: ({ row }) => (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                {row.original.role.toUpperCase()}
            </span>
        ),
    },
    {
        accessorKey: "org_slug",
        header: "Organization",
        cell: ({ row }) => (
            row.original.org_slug ? (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                    {row.original.org_slug}
                </code>
            ) : (
                <span className="text-xs text-muted-foreground italic">Platform Admin</span>
            )
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
                        <EditUserDialog 
                            user={row.original} 
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Edit details
                                </DropdownMenuItem>
                            }
                        />
                        <DropdownMenuItem className="text-destructive">
                            Delete user
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    }
];

export function UserTable({ data: initialData, orgSlug }: { data: UserRow[], orgSlug?: string }) {
    const router = useRouter();
    const [data, setData] = useState(initialData);
    const [isPending, startTrans] = useTransition();

    const handleDelete = (id: string, name: string) => {
        startTrans(async () => {
            try {
                const result = await adminDeleteUser(id);
                if (result.success) {
                    toast.success(`"${name}" removed from platform`);
                    setData((prev) => prev.filter((u) => u.id !== id));
                    startTransition(() => router.refresh());
                } else {
                    toast.error(result.message || "Failed to delete");
                }
            } catch (err: any) {
                toast.error(err.message || "Something went wrong");
            }
        });
    };

    const columns: ColumnDef<UserRow>[] = [
        {
            accessorKey: "name",
            header: "Full Name",
            id: "name",
            cell: ({ row }) => (
                <TableCellViewer header={row.original.name} item={row.original} />
            ),
        },
        {
            accessorKey: "email",
            header: "Email Address",
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
        },
        {
            accessorKey: "role",
            header: "Platform Role",
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors border-transparent bg-secondary text-secondary-foreground">
                    {row.original.role.toUpperCase()}
                </span>
            ),
        },
        {
            accessorKey: "org_slug",
            header: "Organization",
            cell: ({ row }) => (
                row.original.org_slug ? (
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                        {row.original.org_slug}
                    </code>
                ) : (
                    <span className="text-xs text-muted-foreground italic">Platform Admin</span>
                )
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
                            <EditUserDialog
                                user={row.original}
                                trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        Edit details
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
                                        Delete user
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete "{row.original.name}"?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently remove this user from the platform. This action cannot be undone.
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
            extraActions={<CreateUserDialog defaultOrgSlug={orgSlug} />}
        />
    );
}
