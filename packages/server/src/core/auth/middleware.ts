import { Elysia } from "elysia";
import { lucia } from "./lucia";

export const requireAuth = new Elysia({ name: "requireAuth" }).derive({ as: "scoped" }, async ({ cookie, set }) => {
	const sessionId = cookie.auth_session?.value;
	if (!sessionId) {
		set.status = 401;
		throw new Error("Unauthorized");
	}

	const { session, user } = await lucia.validateSession(sessionId as string);
	if (!session || !user) {
		set.status = 401;
		throw new Error("Unauthorized");
	}

	if (session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookie.auth_session?.set({
			value: sessionCookie.value,
			...sessionCookie.attributes,
		});
	}

	return { session, user };
});

export const optionalAuth = new Elysia({ name: "optionalAuth" }).derive(async ({ cookie }) => {
	const sessionId = cookie.auth_session?.value;
	if (!sessionId) {
		return { session: null, user: null };
	}
	const { session, user } = await lucia.validateSession(sessionId as string);

	if (session?.fresh && cookie.auth_session) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookie.auth_session?.set({
			value: sessionCookie.value,
			...sessionCookie.attributes,
		});
	}
	return { session, user };
});
