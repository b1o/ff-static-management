import Elysia from "elysia";
import { requireAuth } from "../auth/auth.middleware";
import { StaticService } from "./static.service";

export const requireStaticMember = new Elysia({ name: "requireStaticMember" })
	.use(requireAuth)
	.derive({ as: "scoped" }, async ({ user, params, set }) => {
		const staticId = params.staticId;
		if (!user) {
			set.status = 401;
			throw new Error("Unauthorized");
		}
		if (!staticId) {
			set.status = 400;
			throw new Error("Static ID is required");
		}
		const staticMember = await StaticService.findMember(staticId, user.id);
		if (!staticMember) {
			set.status = 403;
			throw new Error("Access denied to this static");
		}
		return { staticMember };
	});

export const requireStaticLeader = new Elysia({ name: "requireStaticLeader" })
	.use(requireAuth)
	.use(requireStaticMember)
	.derive({ as: "scoped" }, async ({ staticMember, set }) => {
		if (!staticMember) {
			set.status = 401;
			throw new Error("Unauthorized");
		}
		if (staticMember.role !== "leader") {
			set.status = 403;
			throw new Error("Leader role required to perform this action");
		}
		return {};
	});
