import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { authRoutes } from "./core/auth";
import { adminRoutes } from "./core/admin";
import { devRoutes } from "./core/dev";
import { staticsRoutesCombined } from "./core/static";
import { openapi } from "@elysiajs/openapi";

const isProduction = process.env.NODE_ENV === "production";

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
					{ name: "Admin", description: "Admin management endpoints" },
					{ name: "Statics", description: "Static management endpoints" },
					{ name: "Members", description: "Static member management endpoints" },
					{ name: "Invites", description: "Invite code management endpoints" },
					{ name: "Dev", description: "Development/testing utilities" },
				],
			},
		})
	)
	.onError(({ error, set }) => {
		// Set HTTP status code from error if available
		if (error instanceof Error && "status" in error && typeof error.status === "number") {
			set.status = error.status;
		}

		if (error instanceof Error) {
			if (!isProduction) {
				console.error("Error occurred:", error);
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
	.use(adminRoutes)
	.use(staticsRoutesCombined);

// Register dev routes before starting server (only in non-production)
if (!isProduction) {
	app.use(devRoutes);
}

// Serve Angular frontend in production
if (isProduction) {
	app.use(
		staticPlugin({
			assets: "./public",
			prefix: "/",
		})
	);

	// SPA fallback - serve index.html for unmatched routes
	app.get("*", () => Bun.file("./public/index.html"));
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(port, (info) => {
	console.log(`Server running at ${info.protocol}://${info.hostname}:${info.port}`);
});

export type App = typeof app;
