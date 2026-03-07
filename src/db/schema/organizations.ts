import { index, pgTable, serial, varchar, boolean } from "drizzle-orm/pg-core";
import { soft_delete, timestamps } from "../columns";
import { relations } from "drizzle-orm";
import { user } from "./auth";

// public organization schema
export const organizations = pgTable(
	"organizations",
	{
		id: serial("id").primaryKey(),
		name: varchar("name").notNull(),
		slug: varchar("slug").unique().notNull(),
		plan: varchar("plan").default("Free").notNull(),
		type: varchar("type").default("Company").notNull(), // College, University, School, Company
		isRoot: boolean("is_root").default(false).notNull(),

		...timestamps,
		...soft_delete,
	},
	(table) => [index("organizations_slug_idx").on(table.slug)],
);

// global platform settings
export const site_config = pgTable("site_config", {
	id: serial("id").primaryKey(),
	platformName: varchar("platform_name", { length: 255 }).default("NextAssist").notNull(),
	supportEmail: varchar("support_email", { length: 255 }).default("support@nextassist.com").notNull(),
	isRegistrationEnabled: boolean("is_registration_enabled").default(true).notNull(),
	maintenanceMode: boolean("maintenance_mode").default(false).notNull(),

	...timestamps,
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type SiteConfig = typeof site_config.$inferSelect;

export const organizations_relations = relations(organizations, ({ many }) => ({
	users: many(user),
}));
