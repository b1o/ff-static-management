import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./core/auth";
import { devRoutes } from "./core/dev";

const app = new Elysia()
	.use(cors())
	.get("/health", () => ({ status: "ok", timestamp: Date.now() }))
	.use(authRoutes)
	.onError(({ error }) => {
		console.error(error);
		if (error instanceof Error) {
			return { error: error.message };
		}
		return { error: "Unknown error occurred" };
	})
	.listen(3000, (info) => {
		console.log(`Server running at ${info.protocol}://${info.hostname}:${info.port}`);
	});

if (process.env.NODE_ENV !== "production") {
	console.log("Loading dev routes...");
	app.use(devRoutes);
}

export type App = typeof app;
