import Elysia, { t } from "elysia";
import { StaticService } from "./static.service";
import { requireAuth } from "../auth/auth.middleware";

export const staticsRoutes = new Elysia({ prefix: "/statics" })
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
	)
	.post(
		"/:staticId/members/add",
		async ({ params, body, user, set }) => {
			try {
				const member = await StaticService.addMember({
					staticId: params.staticId,
					userId: body.userId,
					role: body.role,
				});
				return { success: true, member };
			} catch (error) {
				set.status = 400;
				return { error: (error as Error).message };
			}
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
	);
