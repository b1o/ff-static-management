import Elysia from "elysia";
import { requireAuth } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { authCookies, authSessionCookie, oauthStateCookie } from "./auth.model";

const DISCORD_USER_INFO_URL = "https://discord.com/api/users/@me";

const publicAuthRoutes = new Elysia({ prefix: "/auth" })
	.get(
		"/discord",
		async ({ cookie: { oauth_state }, redirect }) => {
			const { url, state } = AuthService.createDiscordAuthorizationURL();

			oauth_state.value = state;
			return redirect(url);
		},
		{
			cookie: oauthStateCookie,
		}
	)
	.get(
		"/discord/callback",
		async ({ query, cookie: { oauth_state, auth_session }, set, redirect }) => {
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
		}
	);

const protectedAuthRoutes = new Elysia({ prefix: "/auth" })
	.use(requireAuth)
	.get("/me", ({ user }) => ({ user }))
	.post(
		"/logout",
		async ({ cookie: { auth_session }, session }) => {
			const blankCookie = await AuthService.logout(session.id);

			auth_session.value = blankCookie.value;
			auth_session.maxAge = 0;

			return { success: true };
		},
		{
			cookie: authSessionCookie,
		}
	);

export const authRoutes = new Elysia().use(publicAuthRoutes).use(protectedAuthRoutes);
