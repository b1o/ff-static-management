import { Elysia, t } from "elysia";
import { requireAuth } from "../auth/auth.middleware";
import { StaticService } from "./static.service";
import { ForbiddenError } from "../../lib/errors";

export const requireStaticMember = new Elysia({ name: "requireStaticMember" })
	.use(requireAuth)
	.guard({ params: t.Object({ staticId: t.String() }) })
	.resolve(async ({ user, params }) => {
		console.log("requireStaticMember running", user?.id);
		if (!user || !params.staticId) throw new ForbiddenError("Invalid request");
		const staticMember = await StaticService.findMember(params.staticId, user.id);
		if (!staticMember) {
			throw new ForbiddenError("Static membership required");
		}
		return { staticMember };
	})
	.as("scoped");

export const requireStaticManager = new Elysia({ name: "requireStaticManager" })
	.use(requireAuth)
	.guard({ params: t.Object({ staticId: t.String() }) })
	.resolve(async ({ user, params }) => {
		console.log("requireStaticManager running", user?.id);
		if (!user || !params.staticId) throw new ForbiddenError("Invalid request");
		const staticMember = await StaticService.findMember(params.staticId, user.id);
		if (!staticMember) {
			throw new ForbiddenError("Static membership required");
		}
		if (!staticMember.canManage) {
			throw new ForbiddenError("Static manager permissions required");
		}
		return { staticMember, isManager: true as const };
	})
	.as("scoped");

export const requireStaticLeader = new Elysia({ name: "requireStaticLeader" })
	.use(requireAuth)
	.guard({ params: t.Object({ staticId: t.String() }) })
	.resolve(async ({ user, params }) => {
		console.log("requireStaticLeader running", user?.id);
		if (!user || !params.staticId) throw new ForbiddenError("Invalid request");
		const staticMember = await StaticService.findMember(params.staticId, user.id);
		if (!staticMember) {
			throw new ForbiddenError("Static membership required");
		}
		if (staticMember.role !== "leader") {
			throw new ForbiddenError("Static leader permissions required");
		}
		console.log(staticMember);
		return { staticMember, isLeader: true as const };
	})
	.as("scoped");
