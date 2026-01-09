import Elysia from "elysia";
import { StaticService } from "./static.service";
import { requireAuth } from "../auth/auth.middleware";
import { requireStaticLeader, requireStaticManager, requireStaticMember } from "./static.middleware";
import {
	createStaticBody,
	createInviteBody,
	updateMemberRoleBody,
	inviteCodeParams,
} from "./static.model";

// Auth-only routes (no static membership required)
const staticsRoutes = new Elysia({ prefix: "/statics" })
	.use(requireAuth)
	.post(
		"/create",
		async ({ body, user }) => {
			const newStatic = await StaticService.create(body.name, user.id);
			return { static: newStatic };
		},
		{
			body: createStaticBody,
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
		"/invite/:code",
		async ({ params, user, redirect }) => {
			const { staticMember } = await StaticService.consumeInviteCode(params.code, user.id);
			return redirect(`${process.env.FRONTEND_URL}/statics/${staticMember.staticId}`);
		},
		{
			params: inviteCodeParams,
			detail: { tags: ["Invites"], summary: "Consume Invite Code and Join Static" },
		}
	);

// Leader-only routes
const staticsLeaderRoutes = new Elysia({ prefix: "/statics/:staticId" })
	.use(requireStaticLeader)
	.delete(
		"/",
		async ({ params }) => {
			await StaticService.deleteStatic(params.staticId);
			return { success: true };
		},
		{ detail: { tags: ["Statics"], summary: "Delete a Static" } }
	);

// Member-only routes (any member can access)
const staticMemberRoutes = new Elysia({ prefix: "/statics/:staticId" })
	.use(requireStaticMember)
	.get(
		"/",
		async ({ params }) => {
			const staticData = await StaticService.findByIdWithMembers(params.staticId);
			return { static: staticData };
		},
		{ detail: { tags: ["Statics"], summary: "Get Static by ID" } }
	)
	.get(
		"/members",
		async ({ params }) => {
			const staticData = await StaticService.findByIdWithMembers(params.staticId);
			return { members: staticData?.members ?? [] };
		},
		{ detail: { tags: ["Members"], summary: "Get Members of a Static" } }
	);

// Manager-only routes
const staticManagerRoutes = new Elysia({ prefix: "/statics/:staticId" })
	.use(requireStaticManager)
	.get(
		"/invites",
		async ({ params }) => {
			const invites = await StaticService.getStaticInvites(params.staticId);
			return { invites };
		},
		{ detail: { tags: ["Invites"], summary: "Get Invite Codes for a Static" } }
	)
	.post(
		"/invite",
		async ({ params, user, body }) => {
			const inviteCode = await StaticService.generateInviteCode({
				staticId: params.staticId,
				expiresAt: body.expiresAt,
				maxUses: body.maxUses,
				createdBy: user.id,
			});
			return { inviteCode };
		},
		{
			body: createInviteBody,
			detail: { tags: ["Invites"], summary: "Generate an Invite Code" },
		}
	)
	.delete(
		"/invite/:code",
		async ({ params }) => {
			await StaticService.deleteInvite(params.staticId, params.code);
			return { success: true };
		},
		{ detail: { tags: ["Invites"], summary: "Delete an Invite Code" } }
	)
	.patch(
		"/members/role",
		async ({ params, body }) => {
			const updatedMember = await StaticService.setMemberPermissions(
				params.staticId,
				body.userId,
				body.canManage
			);
			return { updatedMember };
		},
		{
			body: updateMemberRoleBody,
			detail: { tags: ["Members"], summary: "Update Member Permissions" },
		}
	)
	.delete(
		"/members/:userId",
		async ({ params }) => {
			await StaticService.removeMember(params.staticId, params.userId);
			return { success: true };
		},
		{ detail: { tags: ["Members"], summary: "Remove a Member from a Static" } }
	);

export const staticsRoutesCombined = new Elysia()
	.use(staticsRoutes)
	.use(staticsLeaderRoutes)
	.use(staticMemberRoutes)
	.use(staticManagerRoutes);
