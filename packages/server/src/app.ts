import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./core/auth";
import { devRoutes } from "./core/dev";
import { staticsRoutesCombined } from "./core/static";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()
	.use(
		openapi({
			documentation: {
				info: {
					title: "FF Static Management API",
					version: "1.0.0",
					description: "API documentation for the FF Static Management backend server.",
				},
				tags: [
					{ name: "Auth", description: "Authentication related endpoints" },
					{ name: "Statics", description: "Static management endpoints" },
					{ name: "Members", description: "Static member management endpoints" },
					{ name: "Dev", description: "Development/testing utilities" },
				],
			},
		})
	)
	.onError(({ error }) => {
		if (error instanceof Error) {
			if (process.env.NODE_ENV !== "production") {
				console.error("Error occurred:", error);
			} else {
				console.error("Error:", error.message);
			}
			return { error: error.message };
		}
		console.error("Unknown error:", error);
		return { error: "Unknown error occurred" };
	})
	.use(
		cors({
			origin: process.env.FRONTEND_URL || "http://localhost:4200",
			credentials: true,
		})
	)
	.get("/health", () => ({ status: "ok", timestamp: Date.now() }))
	.use(authRoutes)
	.use(staticsRoutesCombined)

	.listen(3000, (info) => {
		console.log(`Server running at ${info.protocol}://${info.hostname}:${info.port}`);
	});

if (process.env.NODE_ENV !== "production") {
	console.log("Loading dev routes...");
	app.use(devRoutes);
}

export type App = typeof app;
