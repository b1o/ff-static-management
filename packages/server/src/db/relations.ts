import { relations } from "drizzle-orm";
import { users, sessions, statics, staticMembers, inviteCodes, characters, staticCharacters } from "./schema";

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	staticMembers: many(staticMembers),
	createdInvites: many(inviteCodes),
	characters: many(characters),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const staticsRelations = relations(statics, ({ many }) => ({
	members: many(staticMembers),
	inviteCodes: many(inviteCodes),
	characters: many(staticCharacters),
}));

export const staticMembersRelations = relations(staticMembers, ({ one }) => ({
	static: one(statics, {
		fields: [staticMembers.staticId],
		references: [statics.id],
	}),
	user: one(users, {
		fields: [staticMembers.userId],
		references: [users.id],
	}),
}));

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
	static: one(statics, {
		fields: [inviteCodes.staticId],
		references: [statics.id],
	}),
	createdByUser: one(users, {
		fields: [inviteCodes.createdBy],
		references: [users.id],
	}),
}));

export const charactersRelations = relations(characters, ({ many }) => ({
	staticAssignments: many(staticCharacters),
}));

export const staticCharactersRelations = relations(staticCharacters, ({ one }) => ({
	static: one(statics, {
		fields: [staticCharacters.staticId],
		references: [statics.id],
	}),
	character: one(characters, {
		fields: [staticCharacters.characterId],
		references: [characters.id],
	}),
}));

