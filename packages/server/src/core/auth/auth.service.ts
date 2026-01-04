import { DiscordOAuth } from "../../lib/discord-oauth";
import { SessionService } from "../session/session.service";
import { UserService } from "../user/user.service";

export abstract class AuthService {
	static createDiscordAuthorizationURL() {
		return DiscordOAuth.createAuthorizationURL();
	}

	static async handleDiscordCallback(code: string) {
		const accessToken = await DiscordOAuth.validateAuthorizationCode(code);
		const discordUser = await DiscordOAuth.getUser(accessToken);
		const user = await UserService.findorCreateFromDiscord(discordUser);
		const { session, cookie } = await SessionService.create(user.id);
		return { discordUser, session, cookie };
	}

	static async logout(sessionId: string) {
		return SessionService.invalidate(sessionId);
	}
}
