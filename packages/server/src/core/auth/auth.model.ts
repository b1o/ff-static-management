import { t } from "elysia";

const isProduction = process.env.NODE_ENV === "production";

export const authSessionCookie = t.Cookie(
	{
		auth_session: t.Optional(t.String()),
	},
	{
		httpOnly: true,
		secure: isProduction,
		path: "/",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	}
);

export const oauthStateCookie = t.Cookie(
	{
		oauth_state: t.Optional(t.String()),
	},
	{
		httpOnly: true,
		secure: isProduction,
		path: "/",
		maxAge: 10 * 60, // 10 minutes
	}
);

export const authCookies = t.Cookie(
	{
		auth_session: t.Optional(t.String()),
		oauth_state: t.Optional(t.String()),
	},
	{
		httpOnly: true,
		secure: isProduction,
		path: "/",
		sameSite: "lax",
	}
);
