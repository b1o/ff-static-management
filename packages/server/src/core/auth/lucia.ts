import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../../db";
import { sessions, users } from "../../db/schema";
import { Lucia } from "lucia";
import { Discord } from "arctic";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},
	getUserAttributes: (data) => ({
		discordId: data.discordId,
		username: data.username,
		displayName: data.displayName,
		avatar: data.avatar,
	}),
});

export const discord = new Discord(
	process.env.DISCORD_CLIENT_ID!,
	process.env.DISCORD_CLIENT_SECRET!,
	process.env.DISCORD_REDIRECT_URI!
);

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			discordId: string;
			username: string;
			displayName: string | null;
			avatar: string | null;
		};
	}
}
