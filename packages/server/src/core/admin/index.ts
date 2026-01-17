import Elysia, { t } from "elysia";
import { requireAdmin } from "./admin.middleware";
import { AdminService } from "./admin.service";
import { SessionService } from "../session/session.service";
import { NotFoundError, ForbiddenError } from "../../lib/errors";

const isProduction = process.env.NODE_ENV === "production";

const adminSessionCookie = t.Cookie(
	{
		auth_session: t.Optional(t.String()),
		admin_session: t.Optional(t.String()),
	},
	{
		httpOnly: true,
		secure: isProduction,
		path: "/",
		sameSite: "lax",
	}
);

export const adminRoutes = new Elysia({ prefix: "/admin" })
	.use(requireAdmin)
	.get(
		"/users",
		async function getAllUsers() {
			const users = await AdminService.getAllUsers();
			return { users };
		},
		{
			detail: { tags: ["Admin"], summary: "Get all users" },
		}
	)
	.post(
		"/impersonate/:userId",
		async function impersonateUser({ params, user, cookie: { auth_session, admin_session } }) {
			const { userId } = params;

			// Can't impersonate yourself
			if (userId === user.id) {
				throw new ForbiddenError("Cannot impersonate yourself");
			}

			// Verify target user exists
			const targetUser = await AdminService.getUserById(userId);
			if (!targetUser) {
				throw new NotFoundError("User not found");
			}

			// Store the admin's current session in admin_session cookie
			const currentAdminSession = auth_session.value;
			admin_session.value = currentAdminSession;
			admin_session.maxAge = 60 * 60 * 24 * 30; // 30 days

			// Create a new session for the target user
			const { session, cookie } = await SessionService.create(targetUser.id);

			// Set the new session as auth_session
			auth_session.value = cookie.value;

			return {
				success: true,
				impersonating: {
					id: targetUser.id,
					username: targetUser.username,
					displayName: targetUser.displayName,
				},
			};
		},
		{
			params: t.Object({
				userId: t.String(),
			}),
			cookie: adminSessionCookie,
			detail: { tags: ["Admin"], summary: "Impersonate a user" },
		}
	)
	.post(
		"/unimpersonate",
		async function unimpersonateUser({ cookie: { auth_session, admin_session }, session }) {
			const adminSessionId = admin_session.value;

			if (!adminSessionId) {
				throw new ForbiddenError("Not currently impersonating");
			}

			// Validate the admin session is still valid
			const { session: originalSession, user: adminUser } =
				await SessionService.validate(adminSessionId as string);

			if (!originalSession || !adminUser) {
				// Admin session expired, clear cookies
				admin_session.remove();
				throw new ForbiddenError("Admin session expired, please login again");
			}

			// Invalidate the impersonated session
			await SessionService.invalidate(session.id);

			// Restore the admin session
			auth_session.value = adminSessionId;
			admin_session.remove();

			return {
				success: true,
				user: {
					id: adminUser.id,
					username: adminUser.username,
					displayName: adminUser.displayName,
				},
			};
		},
		{
			cookie: adminSessionCookie,
			detail: { tags: ["Admin"], summary: "Stop impersonating and restore admin session" },
		}
	);
