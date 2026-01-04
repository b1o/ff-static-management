import { lucia } from "../../lib/lucia";

export abstract class SessionService {
	static async create(userId: string) {
		const session = await lucia.createSession(userId, {});
		const cookie = lucia.createSessionCookie(session.id);
		return {
			session,
			cookie,
		};
	}

	static async validate(sessionId: string) {
		return lucia.validateSession(sessionId);
	}

	static createCookie(sessionId: string) {
		return lucia.createSessionCookie(sessionId);
	}

	static async invalidate(sessionId: string) {
		await lucia.invalidateSession(sessionId);
		return lucia.createBlankSessionCookie();
	}
}
