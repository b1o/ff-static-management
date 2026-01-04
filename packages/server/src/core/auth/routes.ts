import Elysia from "elysia";
import { requireAuth } from "./middleware";
import { generateCodeVerifier, generateState } from "arctic";
import { discord, lucia } from "./lucia";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema";
import { db } from "../../db";
import { generateIdFromEntropySize } from "lucia";

interface DiscordUser {
	id: string;
	username: string;
	global_name: string | null;
	avatar: string | null;
}

const publicAuthRoutes = new Elysia({ prefix: "/auth" })
	.get("/discord", async ({ cookie, redirect }) => {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const url = discord.createAuthorizationURL(state, null, ["identify"]);

		cookie.oauth_state?.set({
			value: state,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 10 * 60, // 10 minutes
		});

		return redirect(url.toString());
	})
	.get("/discord/callback", async ({ query, cookie, set, redirect }) => {
		const { code, state } = query;
		const storedState = cookie.oauth_state?.value;

		if (!code || !state || !storedState || state !== storedState) {
			set.status = 400;
			return { error: "Invalid request" };
		}

		try {
			console.log("Authorization code:", code);
			const tokens = await discord.validateAuthorizationCode(code, null);

			const response = await fetch("https://discord.com/api/users/@me", {
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			});

			const discordUser = (await response.json()) as DiscordUser;

			let user = await db.query.users.findFirst({
				where: eq(users.discordId, discordUser.id),
			});

			if (!user) {
				const userId = generateIdFromEntropySize(10);
				const [newUser] = await db
					.insert(users)
					.values({
						id: userId,
						discordId: discordUser.id,
						username: discordUser.username,
						displayName: discordUser.global_name || discordUser.username,
						avatar: discordUser.avatar,
					})
					.returning();
				user = newUser;
			} else {
				const [updatedUser] = await db
					.update(users)
					.set({
						username: discordUser.username,
						displayName: discordUser.global_name || discordUser.username,
						avatar: discordUser.avatar,
					})
					.where(eq(users.id, user.id))
					.returning();
				user = updatedUser;
			}

			const session = await lucia.createSession(user!.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookie.auth_session?.set({
				value: sessionCookie.value,
				...sessionCookie.attributes,
			});

			cookie.oauth_state?.remove();
			return redirect(process.env.FRONTEND_URL || "http://localhost:4200");
		} catch (e) {
			console.error("Oauth callback error:", e);
			set.status = 500;
			return { error: "Authentication failed" };
		}
	});

const protectedAuthRoutes = new Elysia({ prefix: "/auth" })
	.use(requireAuth)
	.get("/me", ({ user }) => ({ user }))
	.post("/logout", async ({ cookie, session }) => {
		await lucia.invalidateSession(session.id);
		const blankCookie = lucia.createBlankSessionCookie();
		cookie.auth_session?.set({
			value: blankCookie.value,
			...blankCookie.attributes,
		});
		return { success: true };
	});

export const authRoutes = new Elysia().use(publicAuthRoutes).use(protectedAuthRoutes);
