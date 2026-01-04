import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// === Auth (Lucia) ===
export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	discordId: text("discord_id").unique().notNull(),
	username: text("username").notNull(),
	displayName: text("display_name").notNull(),
	avatar: text("avatar"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: integer("expires_at").notNull(),
});

// === Statics & Membership ===
export const statics = sqliteTable("statics", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const staticMembers = sqliteTable("static_members", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	staticId: text("static_id")
		.notNull()
		.references(() => statics.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: text("role", { enum: ["leader", "member"] })
		.notNull()
		.default("member"),
	canManage: integer("can_manage", { mode: "boolean" }).notNull().default(false),
	joinedAt: integer("joined_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const inviteCodes = sqliteTable("invite_codes", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	staticId: text("static_id")
		.notNull()
		.references(() => statics.id, { onDelete: "cascade" }),
	code: text("code").notNull().unique(),
	createdBy: text("created_by")
		.notNull()
		.references(() => users.id),
	expiresAt: integer("expires_at", { mode: "timestamp" }),
	maxUses: integer("max_uses"),
	uses: integer("uses").notNull().default(0),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

// === Type exports ===
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Static = typeof statics.$inferSelect;
export type NewStatic = typeof statics.$inferInsert;
export type StaticMember = typeof staticMembers.$inferSelect;
export type NewStaticMember = Pick<StaticMember, "staticId" | "userId" | "role">;
export type InviteCode = typeof inviteCodes.$inferSelect;
