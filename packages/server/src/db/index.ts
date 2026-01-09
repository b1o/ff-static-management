import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import * as relations from "./relations";

const sqlite = new Database("./data/app.db");
sqlite.exec("PRAGMA foreign_keys = ON;");

const fullSchema = { ...schema, ...relations };
export const db = drizzle(sqlite, { schema: fullSchema });
