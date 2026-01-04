import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users, type NewUser } from "../../db/schema";
import type { DiscordUser } from "../../lib/discord-oauth";
import { generateIdFromEntropySize } from "lucia";
import { DatabaseError } from "../../lib/errors";

export abstract class UserService {
	static async findById(id: string) {
		return db.query.users.findFirst({
			where: eq(users.id, id),
		});
	}

	static async findByDiscordId(discordId: string) {
		return db.query.users.findFirst({
			where: eq(users.discordId, discordId),
		});
	}

	static async create(data: Omit<NewUser, "id" | "createdAt">) {
		const userId = generateIdFromEntropySize(10);
		const [newUser] = await db
			.insert(users)
			.values({
				id: userId,
				discordId: data.discordId,
				username: data.username,
				displayName: data.displayName,
				avatar: data.avatar,
			})
			.returning();

		if (!newUser) throw new DatabaseError("Failed to create user");
		return newUser;
	}

	static async updateFromDiscord(userId: string, discordUser: DiscordUser) {
		const [updatedUser] = await db
			.update(users)
			.set({
				username: discordUser.username,
				displayName: discordUser.global_name || discordUser.username,
				avatar: discordUser.avatar,
			})
			.where(eq(users.id, userId))
			.returning();
		if (!updatedUser) throw new DatabaseError("Failed to update user");
		return updatedUser;
	}

	static async findorCreateFromDiscord(discordUser: DiscordUser) {
		const existingUser = await this.findByDiscordId(discordUser.id);
		if (existingUser) {
			return this.updateFromDiscord(existingUser.id, discordUser);
		}

		return this.create({
			discordId: discordUser.id,
			username: discordUser.username,
			displayName: discordUser.global_name || discordUser.username,
			avatar: discordUser.avatar,
		});
	}
}
