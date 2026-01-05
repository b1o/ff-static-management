import Elysia, { t } from "elysia";
import { StaticService } from "./static.service";
import { requireAuth } from "../auth/auth.middleware";
import { requireStaticLeader, requireStaticManager, requireStaticMember } from "./static.middleware";

// Auth-only routes (no static membership required)
const staticsRoutes = new Elysia({ prefix: "/statics" })
	.use(requireAuth)
	.post(
		"/create",
		async ({ body, user }) => {
			const newStatic = await StaticService.create(body.name, user.id);
			return { success: true, newStatic };
		},
		{
			body: t.Object({ name: t.String() }),
			detail: { tags: ["Statics"], summary: "Create a New Static" },
		}
	)
	.get(
		"/my-statics",
		async ({ user }) => {
			const statics = await StaticService.getUsersStatics(user.id);
			return { statics };
		},
		{ detail: { tags: ["Statics"], summary: "Get Current User's Statics" } }
	)
	.get(
		"/:staticId",
		async ({ params, set }) => {
			const staticData = await StaticService.findByIdWithMembers(params.staticId);
			if (!staticData) {
				set.status = 404;
				return { error: "Static not found or access denied" };
			}
			return { static: staticData };
		},
		{
			params: t.Object({ staticId: t.String() }),
			detail: { tags: ["Statics"], summary: "Get Static by ID" },
		}
	);

// Leader-only routes
const staticsLeaderRoutes = new Elysia({ prefix: "/statics/:staticId" }).use(requireStaticLeader).delete(
	"/",
	async ({ params }) => {
		await StaticService.deleteStatic(params.staticId);
		return { success: true };
	},
	{ detail: { tags: ["Statics"], summary: "Delete a Static" } }
);

// Member-only routes (any member can access)
const staticMemberRoutes = new Elysia({ prefix: "/statics/:staticId" }).use(requireStaticMember).get(
	"/members",
	async ({ params }) => {
		const staticData = await StaticService.findByIdWithMembers(params.staticId);
		return { members: staticData?.members || [] };
	},
	{ detail: { tags: ["Members"], summary: "Get Members of a Static" } }
);

// Manager-only routes
const staticManagerRoutes = new Elysia({ prefix: "/statics/:staticId" })
	.use(requireStaticManager)
	.post(
		"/members",
		async ({ params, body }) => {
			const member = await StaticService.addMember({
				staticId: params.staticId,
				userId: body.userId,
				role: body.role,
			});
			return { success: true, member };
		},
		{
			body: t.Object({
				userId: t.String(),
				role: t.Enum({ leader: "leader", member: "member" }),
			}),
			detail: { tags: ["Members"], summary: "Add a Member to a Static" },
		}
	)
	.delete(
		"/members/:userId",
		async ({ params }) => {
			await StaticService.removeMember(params.staticId, params.userId);
			return { success: true };
		},
		{ detail: { tags: ["Members"], summary: "Remove a Member from a Static" } }
	)
	.patch(
		"/members/:userId/role",
		async ({ params, body }) => {
			const updatedMember = await StaticService.setMemberPermissions(params.staticId, params.userId, body.canManage);
			return { success: true, updatedMember };
		},
		{
			params: t.Object({ staticId: t.String(), userId: t.String() }),
			body: t.Object({ canManage: t.Boolean() }),
			detail: { tags: ["Members"], summary: "Update a Member's Role in a Static" },
		}
	);

export const staticsRoutesCombined = new Elysia()
	.use(staticsRoutes)
	.use(staticsLeaderRoutes)
	.use(staticMemberRoutes)
	.use(staticManagerRoutes);
