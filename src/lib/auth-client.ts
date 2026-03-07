import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	additionalFields: {
		user: {
			role: {
				type: "string",
			},
			org_slug: {
				type: "string",
			},
		},
	},
	plugins: [
		adminClient(),
	],
});

export const { signIn, signUp, useSession, signOut } = authClient;
