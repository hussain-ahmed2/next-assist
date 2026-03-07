"use server";

import { getSession } from "@/lib/session";
import { ForbiddenError } from "@/lib/errors";
import { tc } from "@/lib/async";
import { revalidatePath } from "next/cache";
import { getSiteConfig, updateSiteConfig } from "@/db/query/site.query";

async function requireSuperAdmin() {
	const session = await getSession();
	if (!session || session.user.role !== "super_admin") {
		throw new ForbiddenError("Only Super Admins can manage platform settings");
	}
	return session;
}

export async function actionGetSiteConfig() {
	return await tc(async () => {
		await requireSuperAdmin();
		return await getSiteConfig();
	});
}

export async function actionUpdateSiteConfig(data: { 
	platformName?: string; 
	supportEmail?: string; 
	isRegistrationEnabled?: boolean; 
	maintenanceMode?: boolean;
}) {
	return await tc(async () => {
		await requireSuperAdmin();
		const updated = await updateSiteConfig(data);
		revalidatePath("/admin/settings");
		return updated;
	});
}
