import { auth } from "./auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	});
});

export const getOrgSlug = cache(async () => {
	const session = await getSession();
	return session?.user?.org_slug ?? null;
});
