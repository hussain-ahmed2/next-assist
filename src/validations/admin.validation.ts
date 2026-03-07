import { z } from "zod";

export const createOrgSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	slug: z.string().min(2, "Slug must be at least 2 characters")
		.regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
		.refine(s => !s.includes(" "), "Slug cannot contain spaces"),
	adminEmail: z.string().email("Please enter a valid email address"),
	plan: z.enum(["Free", "Startup", "Enterprise"]),
});

export type CreateOrgSchema = z.infer<typeof createOrgSchema>;

export const createUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	role: z.enum(["user", "member", "expert", "org_admin", "super_admin"]),
	org_slug: z.string().optional(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const updateOrgSchema = createOrgSchema.partial().extend({
	id: z.number(),
});

export type UpdateOrgSchema = z.infer<typeof updateOrgSchema>;

export const updateUserSchema = createUserSchema.extend({
	password: z.string().min(6).optional(),
}).partial().extend({
	id: z.string(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
