import { Elysia, file } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./db";
import { authRoutes } from "./core/auth";
import { adminRoutes } from "./core/admin";
import { devRoutes } from "./core/dev";
import { staticsRoutesCombined } from "./core/static";
import { openapi } from "@elysiajs/openapi";
import { characterRoutes } from "./core/characters";

import { opentelemetry } from "@elysiajs/opentelemetry";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";

const isProduction = process.env.NODE_ENV === "production";

// Run migrations on startup
migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Database migrations complete");

const API = new Elysia({ prefix: "/api" })
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
		}),
	)

	.get("/health", () => ({ status: "ok", timestamp: Date.now() }))
	.post("/telemetry/v1/traces", async ({ request, set }) => {
		const apiKey = process.env.HONEYCOMB_API_KEY;
		if (!apiKey) {
			set.status = 503;
			return { error: "Telemetry not configured" };
		}

		const body = await request.arrayBuffer();
		const response = await fetch("https://api.honeycomb.io/v1/traces", {
			method: "POST",
			headers: {
				"Content-Type": request.headers.get("Content-Type") || "application/x-protobuf",
				"x-honeycomb-team": apiKey,
			},
			body,
		});

		set.status = response.status;
		return new Response(null, { status: response.status });
	})
	.use(authRoutes)
	.use(adminRoutes)
	.use(staticsRoutesCombined)
	.use(characterRoutes);

const app = new Elysia()
	.use(
		opentelemetry({
			serviceName: process.env.HONEYCOMB_SERVICE_NAME || "ff-static-management-api",
			spanProcessors: [
				new BatchSpanProcessor(
					new OTLPTraceExporter({
						url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
						headers: {
							"x-honeycomb-team": process.env.HONEYCOMB_API_KEY || "",
						},
					}),
				),
			],
			checkIfShouldTrace: (request) => {
				return !request.url.includes("/api/telemetry/");
			},
		}),
	)
	.use(
		cors({
			origin: process.env.FRONTEND_URL || "http://localhost:4200",
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization", "traceparent", "tracestate", "x-honeycomb-team"],
			exposeHeaders: ["traceparent", "tracestate"],
		}),
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
	.use(API)
	.use(
		staticPlugin({
			assets: "./public",
			prefix: "/",
			indexHTML: true,
			alwaysStatic: true,
		}),
	)
	.get("/*", ({ path }) => {
		console.log(`Unhandled route: ${path}, serving index.html`);
		return file("./public/index.html");
	})
	.onError(({ code, path, set, headers }) => {
		const acceptsJson = headers["accept"]?.includes("application/json");
		console.log(path);

		if (code === "NOT_FOUND" && !path.startsWith("/api") && !path.startsWith("/assets") && !acceptsJson) {
			set.status = 200;
			return file("./public/index.html");
		}
	});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(
	{
		hostname: "0.0.0.0",
		port,
	},
	(info) => {
		console.log(`Server running at ${info.protocol}://${info.hostname}:${info.port}`);
	},
);

export type App = typeof app;
