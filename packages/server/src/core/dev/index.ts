import { Elysia, t } from "elysia";
import { generateIdFromEntropySize } from "lucia";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export const devRoutes = new Elysia({ prefix: "/dev" })
  .post(
    "/dummy-user",
    async () => {
      const randomId = Math.random().toString(36).substring(2, 8);
      const userId = generateIdFromEntropySize(10);

      const [user] = await db
        .insert(users)
        .values({
          id: userId,
          discordId: `dummy_${randomId}`,
          username: `dummy_${randomId}`,
          displayName: `Dummy User ${randomId}`,
          avatar: null,
        })
        .returning();

      return { user };
    },
    {
      detail: { tags: ["Dev"], summary: "Create a dummy user" },
    }
  )
  .get(
    "/users",
    async () => {
      const allUsers = await db.query.users.findMany();
      return { users: allUsers };
    },
    {
      detail: { tags: ["Dev"], summary: "List all users" },
    }
  )
  .delete(
    "/users/:userId",
    async ({ params }) => {
      await db.delete(users).where(eq(users.id, params.userId));
      return { success: true };
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      detail: { tags: ["Dev"], summary: "Delete a user" },
    }
  );