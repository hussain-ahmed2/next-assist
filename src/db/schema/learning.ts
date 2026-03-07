import { pgTable, serial, varchar, text, integer, boolean } from "drizzle-orm/pg-core";
import { timestamps, soft_delete } from "../columns";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const courses = pgTable("courses", {
	id: serial("id").primaryKey(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	published: boolean().default(false).notNull(),
	creatorId: text("creator_id")
		.references(() => user.id)
		.notNull(),

	...timestamps,
	...soft_delete,
});

export const lessons = pgTable("lessons", {
	id: serial("id").primaryKey(),
	courseId: integer("course_id")
		.references(() => courses.id)
		.notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text(),
	order: integer().default(0).notNull(),

	...timestamps,
	...soft_delete,
});

export const courseEnrollment = pgTable("course_enrollment", {
	id: serial("id").primaryKey(),
	courseId: integer("course_id")
		.references(() => courses.id)
		.notNull(),
	memberId: text("member_id")
		.references(() => user.id)
		.notNull(),

	...timestamps,
});

export const courseProgress = pgTable("course_progress", {
	id: serial("id").primaryKey(),
	courseId: integer("course_id")
		.references(() => courses.id)
		.notNull(),
	memberId: text("member_id")
		.references(() => user.id)
		.notNull(),
	lessonsCompleted: integer("lessons_completed").default(0).notNull(),
	completedAt: timestamps.createdAt.notNull().default(null),

	...timestamps,
});

export const coursesRelations = relations(courses, ({ many, one }) => ({
	lessons: many(lessons),
	creator: one(user, {
		fields: [courses.creatorId],
		references: [user.id],
	}),
	enrollments: many(courseEnrollment),
	progress: many(courseProgress),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id],
	}),
}));

export const courseEnrollmentRelations = relations(courseEnrollment, ({ one }) => ({
	course: one(courses, {
		fields: [courseEnrollment.courseId],
		references: [courses.id],
	}),
	member: one(user, {
		fields: [courseEnrollment.memberId],
		references: [user.id],
	}),
}));

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
	course: one(courses, {
		fields: [courseProgress.courseId],
		references: [courses.id],
	}),
	member: one(user, {
		fields: [courseProgress.memberId],
		references: [user.id],
	}),
}));
