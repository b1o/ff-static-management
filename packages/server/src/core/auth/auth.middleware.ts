import { Elysia } from "elysia";
import { UnauthorizedError } from "../../lib/errors";
import { SessionService } from "../session/session.service";

export const requireAuth = new Elysia({ name: "requireAuth" }).derive({ as: "scoped" }, async ({ cookie }) => {
	const sessionId = cookie.auth_session?.value;
	if (!sessionId) {
		throw new UnauthorizedError();
	}

	const { session, user } = await SessionService.validate(sessionId as string);
	if (!session || !user) {
		throw new UnauthorizedError();
	}

	if (session.fresh) {
		const sessionCookie = SessionService.createCookie(session.id);
		cookie.auth_session?.set({
			value: sessionCookie.value,
			...sessionCookie.attributes,
		});
	}

	return { session, user };
});

export const optionalAuth = new Elysia({ name: "optionalAuth" }).derive({ as: "scoped" }, async ({ cookie }) => {
	const sessionId = cookie.auth_session?.value;
	if (!sessionId) {
		return { session: null, user: null };
	}

	const { session, user } = await SessionService.validate(sessionId as string);
	if (!session || !user) {
		return { session: null, user: null };
	}
	if (session.fresh) {
		const sessionCookie = SessionService.createCookie(session.id);
		cookie.auth_session?.set({
			value: sessionCookie.value,
			...sessionCookie.attributes,
		});
	}

	return { session, user };
});
