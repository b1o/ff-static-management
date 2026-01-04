import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./core/auth/routes";

const app = new Elysia()
	.use(cors())
	.get("/health", () => ({ status: "ok", timestamp: Date.now() }))
	.use(authRoutes)
	.listen(3000, (info) => {
		console.log(`Server running at ${info.protocol}://${info.hostname}:${info.port}`);
	});

export type App = typeof app;
