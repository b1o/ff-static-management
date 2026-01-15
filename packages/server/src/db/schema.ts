import { sqliteTable, text, integer, unique, index } from "drizzle-orm/sqlite-core";

// === Auth (Lucia) ===
export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	discordId: text("discord_id").unique().notNull(),
	username: text("username").notNull(),
	displayName: text("display_name").notNull(),
	avatar: text("avatar"),
	isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
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

export const staticMembers = sqliteTable(
	"static_members",
	{
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
	},
	(table) => [unique().on(table.staticId, table.userId)]
);

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
		.references(() => users.id, { onDelete: "set null" }),
	expiresAt: integer("expires_at", { mode: "timestamp" }),
	maxUses: integer("max_uses"),
	uses: integer("uses").notNull().default(0),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

// === Characters ===
export const characters = sqliteTable(
	"characters",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		world: text("world").notNull(),
		DC: text("dc").notNull(),
		data: text("data", { mode: "json" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		unique().on(table.userId, table.name, table.world, table.DC),
		index("idx_characters_userId").on(table.userId),
	]
);

export const staticCharacters = sqliteTable(
	"static_characters",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		staticId: text("static_id")
			.notNull()
			.references(() => statics.id, { onDelete: "cascade" }),
		characterId: text("character_id")
			.notNull()
			.references(() => characters.id, { onDelete: "cascade" }),
		role: text("role", { enum: ["main", "alt"] })
			.notNull()
			.default("main"),
		assignedAt: integer("assigned_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [
		unique().on(table.staticId, table.characterId),
		index("idx_staticCharacters_staticId").on(table.staticId),
		index("idx_staticCharacters_characterId").on(table.characterId),
	]
);

// === Cache ===
export const cacheCharacters = sqliteTable(
	"cache_characters",
	{
		lodestoneId: text("lodestone_id").primaryKey(),
		name: text("name").notNull(),
		world: text("world").notNull(),
		dc: text("dc").notNull(),
		avatar: text("avatar"),
		data: text("data", { mode: "json" }),
		fetchedAt: integer("fetched_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		index("idx_cache_expires").on(table.expiresAt),
		index("idx_cache_name_world").on(table.name, table.world),
	]
);

// === Type exports ===
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Static = typeof statics.$inferSelect;
export type NewStatic = typeof statics.$inferInsert;
export type StaticMember = typeof staticMembers.$inferSelect;
export type NewStaticMember = Pick<StaticMember, "staticId" | "userId">;
export type InviteCode = typeof inviteCodes.$inferSelect;

export type NewInviteCodeRequest = Pick<InviteCode, "staticId" | "expiresAt" | "maxUses">;

export type CachedCharacter = typeof cacheCharacters.$inferSelect;
