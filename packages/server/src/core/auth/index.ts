import Elysia from "elysia";
import { requireAuth } from "./auth.middleware";
import { AuthService } from "./auth.service";

const DISCORD_USER_INFO_URL = "https://discord.com/api/users/@me";

const publicAuthRoutes = new Elysia({ prefix: "/auth" })
	.get("/discord", async ({ cookie, redirect }) => {
		const { url, state } = AuthService.createDiscordAuthorizationURL();

		cookie.oauth_state?.set({
			value: state,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 10 * 60, // 10 minutes
		});

		return redirect(url);
	})
	.get("/discord/callback", async ({ query, cookie, set, redirect }) => {
		const { code, state } = query;
		const storedState = cookie.oauth_state?.value;

		if (!code || !state || !storedState || state !== storedState) {
			set.status = 400;
			return { error: "Invalid request" };
		}

		const { cookie: sessionCookie } = await AuthService.handleDiscordCallback(code);
		cookie.auth_session?.set({
			value: sessionCookie.value,
			...sessionCookie.attributes,
		});

		cookie.oauth_state?.remove();
		return redirect(process.env.FRONTEND_URL || "/");
	});

const protectedAuthRoutes = new Elysia({ prefix: "/auth" })
	.use(requireAuth)
	.get("/me", ({ user }) => ({ user }))
	.post("/logout", async ({ cookie, session }) => {
		const blankCookie = await AuthService.logout(session.id);
		cookie.auth_session?.set({
			value: blankCookie.value,
			...blankCookie.attributes,
		});
		return { success: true };
	});

export const authRoutes = new Elysia().use(publicAuthRoutes).use(protectedAuthRoutes);
