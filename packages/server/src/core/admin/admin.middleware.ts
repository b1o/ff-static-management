import { Elysia, t } from "elysia";
import { SessionService } from "../session/session.service";
import { ForbiddenError, UnauthorizedError } from "../../lib/errors";

export const requireAdmin = new Elysia({ name: "requireAdmin" })
	.guard({ cookie: t.Object({ auth_session: t.Optional(t.String()), admin_session: t.Optional(t.String()) }) })
	.resolve(async function validateAdminSession({ cookie }) {
		const adminSessionId = cookie.admin_session?.value;
		const authSessionId = cookie.auth_session?.value;

		// When impersonating, validate the stored admin session
		if (adminSessionId) {
			const { user: adminUser } = await SessionService.validate(adminSessionId);
			if (!adminUser?.isAdmin) {
				throw new ForbiddenError("Admin access required");
			}
		}

		// Validate current auth session
		if (!authSessionId) {
			throw new UnauthorizedError("Authentication required");
		}

		const { session, user } = await SessionService.validate(authSessionId);
		if (!session || !user) {
			throw new UnauthorizedError("Authentication required");
		}

		// If not impersonating, verify the current user is admin
		if (!adminSessionId && !user.isAdmin) {
			throw new ForbiddenError("Admin access required");
		}

		// Refresh session cookie if needed
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
