import { getSession } from "@/lib/session";
import { getOrganizationBySlug } from "@/db/query/organization.query";
import { OrgSettingsForm } from "@/components/dashboard/org-settings-form";
import { notFound, redirect } from "next/navigation";

export default async function OrgSettingsPage() {
    const session = await getSession();
    if (!session || !session.user.org_slug) {
        redirect("/auth/signin");
    }

    const organization = await getOrganizationBySlug(session.user.org_slug);

    if (!organization) {
        notFound();
    }

    return <OrgSettingsForm organization={organization} />;
}
