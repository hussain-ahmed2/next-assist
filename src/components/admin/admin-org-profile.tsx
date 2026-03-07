"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Building2, 
    Users as UsersIcon, 
    BookOpen, 
    Globe, 
    Calendar, 
    ArrowLeft,
    ShieldCheck,
    Lock,
    Zap,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { UserTable } from "./user-table";

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    org_slug: string | null;
    createdAt: string;
    status: "Done" | "In Progress" | "Not Started" | "Review";
};

type Props = {
    organization: {
        id: number;
        name: string;
        slug: string;
        plan: string;
        createdAt: any;
    };
    members: UserRow[];
    coursesCount: number;
};

export function AdminOrgProfile({ organization, members, coursesCount }: Props) {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/admin/organizations">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">{organization.name}</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                             <Globe className="size-3.5 text-primary" /> platform.assist.biz/{organization.slug}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    SYSTEM INSTANCE: #{organization.id.toString().padStart(4, '0')}
                </Badge>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20 shadow-sm border-none bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <UsersIcon className="size-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provisioned Users</p>
                                <p className="text-2xl font-black tracking-tight">{members.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                <BookOpen className="size-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tenant Courses</p>
                                <p className="text-2xl font-black tracking-tight">{coursesCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-linear-to-br from-emerald-500/10 to-transparent border-emerald-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                <Zap className="size-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instance Tier</p>
                                <p className="text-2xl font-black tracking-tight">{organization.plan}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Infrastructure Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-border/60 shadow-sm overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="size-3.5 text-primary" /> Metadata Audit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Physical Schema</p>
                                <p className="text-xs font-mono font-bold bg-muted p-2 rounded-lg border border-border/40 truncate">
                                    {organization.slug}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Genesis Date</p>
                                <p className="text-xs font-bold flex items-center gap-2">
                                    <Calendar className="size-3.5 text-muted-foreground" /> {new Date(organization.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Database Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-bold uppercase">Synced & Healthy</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border/40">
                                <Button variant="outline" className="w-full text-xs font-bold h-9 gap-2" asChild>
                                    <Link href={`/admin/courses?org=${organization.slug}`}>
                                        <BookOpen className="size-3.5" /> View Org Courses
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm bg-muted/5">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Admin Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-xs font-bold" disabled>
                                <Lock className="size-3.5" /> Freeze Instance
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-xs font-bold" asChild>
                                <a href={`https://${organization.slug}.assist.biz`} target="_blank" className="flex items-center gap-2">
                                    <ExternalLink className="size-3.5" /> Open Tenant Site
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Member Management */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-border/60 shadow-sm border-none bg-transparent">
                        <CardHeader className="px-0 pt-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tighter">Organization Roster</CardTitle>
                                    <CardDescription>Directory of all administrative and learning accounts within this instance.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <UserTable data={members} orgSlug={organization.slug} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
