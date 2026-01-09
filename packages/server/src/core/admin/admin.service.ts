import { db } from "../../db";
import { users } from "../../db/schema";
import { NotFoundError } from "../../lib/errors";
import { eq } from "drizzle-orm";

export abstract class AdminService {
	static async getAllUsers() {
		return db.query.users.findMany({
			columns: {
				id: true,
				discordId: true,
				username: true,
				displayName: true,
				avatar: true,
				isAdmin: true,
				createdAt: true,
			},
		});
	}

	static async getUserById(userId: string) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	}
}
