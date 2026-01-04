import { relations } from "drizzle-orm";
import { users, sessions, statics, staticMembers, inviteCodes } from "./schema";

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	staticMembers: many(staticMembers),
	createdInvites: many(inviteCodes),
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
