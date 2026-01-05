import { Elysia, t } from "elysia";
import { SessionService } from "../session/session.service";
import { UnauthorizedError } from "../../lib/errors";

export const requireAuth = new Elysia({ name: "requireAuth" })
	.guard({ cookie: t.Object({ auth_session: t.Optional(t.String()) }) })
	.resolve(async ({ cookie }) => {
		console.log("requireAuth running");
		const sessionId = cookie.auth_session?.value;
		if (!sessionId) {
			throw new UnauthorizedError("Authentication required");
		}
		const { session, user } = await SessionService.validate(sessionId as string);
		if (!session || !user) {
			throw new UnauthorizedError("Authentication required");
		}
		if (session.fresh) {
			const sessionCookie = SessionService.createCookie(session.id);
			cookie.auth_session?.set({
				value: sessionCookie.value,
				...sessionCookie.attributes,
			});
		}
		return { session, user };
	})
	.as("scoped");