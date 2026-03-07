import { timestamp, boolean } from "drizzle-orm/pg-core";

export const timestamps = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
};

export const soft_delete = {
	deletedAt: timestamp("deleted_at"),
	deleted: boolean("deleted").notNull().default(false),
};
