import Elysia, { t } from "elysia";
import { requireAuth } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { authCookies, authSessionCookie, oauthStateCookie } from "./auth.model";

const DISCORD_USER_INFO_URL = "https://discord.com/api/users/@me";

const publicAuthRoutes = new Elysia({ prefix: "/auth" })
	.get(
		"/discord",
		async function initiateDiscordAuth({ cookie: { oauth_state }, redirect }) {
			const { url, state } = AuthService.createDiscordAuthorizationURL();

			oauth_state.value = state;
			return {
				url,
			}
		},
		{
			cookie: oauthStateCookie,
			detail: { tags: ["Auth"], summary: "Initiate Discord OAuth2 Flow" },
		}
	)
	.get(
		"/discord/callback",
		async function handleDiscordCallback({ query, cookie: { oauth_state, auth_session }, set, redirect }) {
			const { code, state } = query;
			const storedState = oauth_state.value;

			if (!code || !state || !storedState || state !== storedState) {
				set.status = 400;
				return { error: "Invalid request" };
			}

			const { cookie: sessionCookie } = await AuthService.handleDiscordCallback(code);
			auth_session.value = sessionCookie.value;
			oauth_state.remove();

			return redirect(process.env.FRONTEND_URL || "/dev/test");
		},
		{
			cookie: authCookies,
			detail: { tags: ["Auth"], summary: "Handle Discord OAuth2 Callback" },
		}
	);

const adminSessionCookieSchema = t.Cookie({
	admin_session: t.Optional(t.String()),
});

const protectedAuthRoutes = new Elysia({ prefix: "/auth" })
	.use(requireAuth)
	.get(
		"/me",
		function getCurrentUser({ user, cookie: { admin_session } }) {
			return {
				user: {
					id: user.id,
					discordId: user.discordId,
					username: user.username,
					displayName: user.displayName,
					avatar: user.avatar,
					isAdmin: user.isAdmin,
					createdAt: user.createdAt,
				},
				isImpersonating: !!admin_session.value,
			};
		},
		{
			cookie: adminSessionCookieSchema,
			detail: { tags: ["Auth"], summary: "Get Current Authenticated User" },
		}
	)
	.post(
		"/logout",
		async function logout({ cookie: { auth_session }, session }) {
			const blankCookie = await AuthService.logout(session.id);

			auth_session.value = blankCookie.value;
			auth_session.maxAge = 0;

			return { success: true };
		},
		{
			cookie: authSessionCookie,
			detail: { tags: ["Auth"], summary: "Logout Current User" },
		}
	);

export const authRoutes = new Elysia().use(publicAuthRoutes).use(protectedAuthRoutes);
