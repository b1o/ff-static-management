import Elysia, { t } from "elysia";
import { requireAuth } from "../auth/auth.middleware";
import { getLodestone } from "../../lib/lodestone";

const lodestone = getLodestone();

const characterRoutes = new Elysia({ prefix: "/characters" })
	.use(requireAuth)
	.get(
		"/search",
		async ({ query: { name, world } }) => {
			const results = await lodestone.searchCharacters({ characterName: name, world });
			return { results };
		},
		{
			query: t.Object({
				name: t.String(),
				world: t.String(),
			}),
		}
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			const character = await lodestone.getCharacter(id);
			return { character };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);

export { characterRoutes };
