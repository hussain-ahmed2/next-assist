import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink } from "better-auth/plugins";
import { ac, super_admin, org_admin, program_manager, expert, member, user } from "./permission";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			org_slug: {
				type: "string",
				required: false,
			},
			phone: {
				type: "string",
				required: false,
			},
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
			},
			isBillingAdmin: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
		},
	},
	plugins: [
		admin({
			ac,
			roles: {
				super_admin,
				org_admin,
				program_manager,
				expert,
				member,
				user,
			},
		}),
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				console.log(`Sending magic link to ${email}: ${url}`);
				// In production, integrate with Resend/Postmark
			},
		}),
		nextCookies(),
	],
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					if (!user.image) {
						user.image = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.name)}`;
					}
					return {
						data: user,
					};
				},
			},
		},
	},
});
