import { Discord, generateState, generateCodeVerifier } from "arctic";

export const discord = new Discord(
	process.env.DISCORD_CLIENT_ID!,
	process.env.DISCORD_CLIENT_SECRET!,
	process.env.DISCORD_REDIRECT_URI!
);

export interface DiscordUser {
	id: string;
	username: string;
	global_name: string | null;
	avatar: string | null;
}

export abstract class DiscordOAuth {
	static readonly USER_INFO_URL = "https://discord.com/api/users/@me";

	static createAuthorizationURL(): { url: string; state: string } {
		const state = generateState();
		const url = discord.createAuthorizationURL(state, null, ["identify"]);
		return { url: url.toString(), state };
	}

	static async validateAuthorizationCode(code: string): Promise<string> {
		const tokens = await discord.validateAuthorizationCode(code, null);
		return tokens.accessToken();
	}

	static async getUser(accessToken: string): Promise<DiscordUser> {
		const response = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			console.error("Failed to fetch Discord user info:", await response.text());
			throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
		}

        return (await response.json()) as DiscordUser;
	}
}
