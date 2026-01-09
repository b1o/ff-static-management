import { t } from "elysia";

// ==================== Params ====================

/** Base params for routes under /statics/:staticId - allows additional params */
export const staticIdParams = t.Object(
	{ staticId: t.String() },
	{ additionalProperties: true }
);

export const inviteCodeParams = t.Object({ code: t.String() });

export const userIdParams = t.Object({ userId: t.String() });

// ==================== Request Bodies ====================

export const createStaticBody = t.Object({
	name: t.String({ minLength: 1, maxLength: 100 }),
});

export const createInviteBody = t.Object({
	expiresAt: t.Nullable(t.Date()),
	maxUses: t.Nullable(t.Number({ minimum: 1 })),
});

export const updateMemberRoleBody = t.Object({
	userId: t.String(),
	canManage: t.Boolean(),
});
