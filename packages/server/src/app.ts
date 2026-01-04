import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./core/auth";
import { devRoutes } from "./core/dev";
import { staticsRoutes } from "./core/static";

const app = new Elysia()
	.onError(({ error }) => {
		console.error(error);
		if (error instanceof Error) {
			return { error: error.message };
		}
		return { error: "Unknown error occurred" };
	})
	.use(cors())
	.get("/health", () => ({ status: "ok", timestamp: Date.now() }))
	.use(authRoutes)
	.use(staticsRoutes)

	.listen(3000, (info) => {
		console.log(`Server running at ${info.protocol}://${info.hostname}:${info.port}`);
	});

if (process.env.NODE_ENV !== "production") {
	console.log("Loading dev routes...");
	app.use(devRoutes);
}

export type App = typeof app;
