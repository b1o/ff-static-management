import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { db } from "../db";
import { sessions, users } from "../db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		name: "auth_session",
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
