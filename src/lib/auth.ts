import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { ac, super_admin, org_admin, expert, member, user } from "./permission";

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
		},
	},
	plugins: [
		admin({
			ac,
			roles: {
				super_admin,
				org_admin,
				expert,
				member,
				user,
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
