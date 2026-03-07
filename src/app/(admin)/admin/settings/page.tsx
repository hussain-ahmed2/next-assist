import { getSiteConfig } from "@/db/query/site.query";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
	const session = await getSession();
	if (!session || session.user.role !== "super_admin") {
		redirect("/auth/signin");
	}

	const config = await getSiteConfig();

	return <SettingsForm initialConfig={config} />;
}
