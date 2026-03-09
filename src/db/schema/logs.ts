import { pgTable, serial, text, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./auth";
import { timestamps } from "../columns";

/**
 * B2B Audit Logs
 * Tracks every critical action an Org Admin or Program Manager takes.
 */
export const auditLogs = pgTable("audit_logs", {
	id: serial("id").primaryKey(),
	org_slug: text("org_slug").notNull(),
	actor_id: text("actor_id").notNull(),
	action: varchar("action", { length: 100 }).notNull(), // e.g., 'SSO_ENABLED', 'MEMBER_INVITED'
	entity_type: varchar("entity_type", { length: 50 }), // 'user', 'organization', 'billing'
	entity_id: text("entity_id"),
	metadata: jsonb("metadata"), // Store diffs or extra info
	ip_address: varchar("ip_address", { length: 45 }),
	user_agent: text("user_agent"),
	...timestamps,
});

/**
 * Organization Invites
 * Supports the "Invite-Only Mode" (IOM) requirement.
 */
export const invites = pgTable("invites", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	org_slug: text("org_slug").notNull(),
	role: varchar("role", { length: 50 }).default("member").notNull(),
	invited_by: text("invited_by").notNull(),
	token: text("token").unique().notNull(),
	expires_at: timestamp("expires_at").notNull(),
	accepted: boolean("accepted").default(false).notNull(),
	...timestamps,
});
