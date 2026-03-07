import { pgTable, serial, varchar, text, integer, boolean } from "drizzle-orm/pg-core";
import { timestamps, soft_delete } from "../columns";
import { relations } from "drizzle-orm";

export const courses = pgTable("courses", {
	id: serial("id").primaryKey(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	published: boolean().default(false).notNull(),
	
	...timestamps,
	...soft_delete,
});

export const lessons = pgTable("lessons", {
	id: serial("id").primaryKey(),
	courseId: integer("course_id").references(() => courses.id).notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text(),
	order: integer().default(0).notNull(),

	...timestamps,
	...soft_delete,
});

export const coursesRelations = relations(courses, ({ many }) => ({
	lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id],
	}),
}));
