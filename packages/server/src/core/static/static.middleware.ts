import { Elysia } from "elysia";
import { requireAuth } from "../auth/auth.middleware";
import { StaticService } from "./static.service";
import { staticIdParams } from "./static.model";
import { ForbiddenError } from "../../lib/errors";

export const requireStaticMember = new Elysia({ name: "requireStaticMember" })
	.use(requireAuth)
	.guard({ params: staticIdParams })
	.resolve(async function checkStaticMembership({ user, params }) {
		const staticMember = await StaticService.findMember(params.staticId, user.id);
		if (!staticMember) {
			throw new ForbiddenError("Static membership required");
		}
		return { staticMember };
	})
	.as("scoped");

export const requireStaticManager = new Elysia({ name: "requireStaticManager" })
	.use(requireAuth)
	.guard({ params: staticIdParams })
	.resolve(async function checkStaticManager({ user, params }) {
		const staticMember = await StaticService.findMember(params.staticId, user.id);
		if (!staticMember) {
			throw new ForbiddenError("Static membership required");
		}
		if (!staticMember.canManage) {
			throw new ForbiddenError("Manager permissions required");
		}
		return { staticMember };
	})
	.as("scoped");

export const requireStaticLeader = new Elysia({ name: "requireStaticLeader" })
	.use(requireAuth)
	.guard({ params: staticIdParams })
	.resolve(async function checkStaticLeader({ user, params }) {
		const staticMember = await StaticService.findMember(params.staticId, user.id);
		if (!staticMember) {
			throw new ForbiddenError("Static membership required");
		}
		if (staticMember.role !== "leader") {
			throw new ForbiddenError("Leader permissions required");
		}
		return { staticMember };
	})
	.as("scoped");
