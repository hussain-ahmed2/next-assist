import { index, pgTable, serial, varchar, boolean, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { soft_delete, timestamps } from "../columns";

export const planEnum = pgEnum("plan_enum", ["Free", "Business", "Enterprise"]);
import { relations } from "drizzle-orm";
import { user } from "./auth";

// public organization schema
export const organizations = pgTable(
	"organizations",
	{
		id: serial("id").primaryKey(),
		name: varchar("name").notNull(),
		slug: varchar("slug").unique().notNull(),
		plan: planEnum("plan").default("Free").notNull(),
		type: varchar("type").default("Company").notNull(), // College, University, School, Company
		isRoot: boolean("is_root").default(false).notNull(),

		// Trial Information
		trialStartDate: timestamp("trial_start_date"),
		trialEndDate: timestamp("trial_end_date"),

		// Org Profile
		legalName: varchar("legal_name"),
		hqAddress: text("hq_address"),
		taxId: varchar("tax_id"), // VAT/EIN

		// Security/Access
		allowedDomains: text("allowed_domains").array(), // Domain Whitelisting
		isIomEnabled: boolean("is_iom_enabled").default(true).notNull(), // Invite-Only Mode
		isPublished: boolean("is_published").default(false).notNull(),
		ssoConfigured: boolean("sso_configured").default(false).notNull(),
		ssoProvider: varchar("sso_provider", { length: 50 }), // okta, azure, google
		ssoMetadata: text("sso_metadata"), // XML or JSON config string

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
