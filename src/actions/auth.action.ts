"use server";

import { auth } from "@/lib/auth";
import { SignInSchema, SignUpSchema } from "@/validations/auth.validation";
import { headers } from "next/headers";
import { tc } from "@/lib/async";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OrgNotFoundError } from "@/lib/errors";
import { redirect } from "next/navigation";

export async function signUp(data: SignUpSchema) {
	const emailParts = data.email.split("@");
	const domain = emailParts.length > 1 ? emailParts[1] : "";
	const rawDomainName = domain.split(".")[0] || "";
	
	const orgSlug = rawDomainName
		.toLowerCase()
		.trim()
		.replace(/[\s\W-]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return await tc(async () => {
		// Only allow sign-up if the org already exists — orgs are created by super admin only
		const [org] = await db
			.select()
			.from(organizations)
			.where(eq(organizations.slug, orgSlug))
			.limit(1);

		if (!org) {
			throw new OrgNotFoundError(domain);
		}

		const response = await auth.api.signUpEmail({
			body: {
				email: data.email,
				password: data.password,
				name: data.name,
				org_slug: orgSlug,
				role: "user",
			},
			headers: await headers(),
		});
		return response;
	});
}

export async function signIn(data: SignInSchema) {
	return await tc(async () => {
		const response = await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password,
			},
			headers: await headers(),
		});
		return response;
	});
}

export async function signOutAction() {
	const head = await headers();
	await auth.api.signOut({
		headers: head,
	});
	redirect("/auth/sign-in");
}

export async function getSession() {
	return await auth.api.getSession({
		headers: await headers(),
	});
}

