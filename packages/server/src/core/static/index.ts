import Elysia, { t } from "elysia";
import { StaticService } from "./static.service";
import { requireAuth } from "../auth/auth.middleware";
import { requireStaticLeader } from "./static.middleware";

const memberStaticsRoutes = new Elysia({ prefix: "/statics" })
	.use(requireAuth)
	.post(
		"/create",
		async ({ body, user }) => {
			const newStatic = await StaticService.create(body.name, user.id);
			return { success: true, newStatic };
		},
		{
			body: t.Object({
				name: t.String(),
			}),
		}
	)
	.get("/my-statics", async ({ user }) => {
		const statics = await StaticService.getUsersStatics(user.id);
		return { statics };
	})
	.get(
		"/:staticId",
		async ({ params, user, set }) => {
			const staticData = await StaticService.findByIdWithMembers(params.staticId);
			if (!staticData) {
				set.status = 404;
				return { error: "Static not found or access denied" };
			}
			return { static: staticData };
		},
		{
			params: t.Object({
				staticId: t.String(),
			}),
		}
	);

const leaderStaticsRoutes = new Elysia({ prefix: "/statics" })
	.use(requireStaticLeader)
	.get(
		"/:staticId/members",
		async ({ params }) => {
			const staticData = await StaticService.findByIdWithMembers(params.staticId);
			return { members: staticData?.members || [] };
		},
		{
			params: t.Object({
				staticId: t.String(),
			}),
		}
	)
	.post(
		"/:staticId/members",
		async ({ params, body, set }) => {
			const member = await StaticService.addMember({
				staticId: params.staticId,
				userId: body.userId,
				role: body.role,
			});
			return { success: true, member };
		},
		{
			params: t.Object({
				staticId: t.String(),
			}),
			body: t.Object({
				userId: t.String(),
				role: t.Enum({
					leader: "leader",
					member: "member",
				}),
			}),
		}
	)
	.delete("/:staticId/members/:userId", async ({ params, set }) => {
		await StaticService.removeMember(params.staticId, params.userId);
		return { success: true };
	})
	.patch(
		"/:staticId/members/:userId/role",
		async ({ params, body, set }) => {
			const updatedMember = await StaticService.updateMemberRole(params.staticId, params.userId, body.newRole);
			return { success: true, updatedMember };
		},
		{
			params: t.Object({
				staticId: t.String(),
				userId: t.String(),
			}),
			body: t.Object({
				newRole: t.Enum({
					leader: "leader",
					member: "member",
				}),
			}),
		}
	);

export const staticsRoutes = new Elysia().use(memberStaticsRoutes).use(leaderStaticsRoutes);
