/**
 * Shared types for frontend consumption.
 * This file exports only TypeScript types - no runtime values.
 * Safe to import in frontend code without bundling backend dependencies.
 */

// === Entity Types (from schema) ===
export type { User, NewUser, Session, Static, NewStatic, StaticMember, NewStaticMember, InviteCode } from "./db/schema";

// === App Type (for Eden client) ===
export type { App } from "./app";

// === Role Types ===
export type MemberRole = "leader" | "member";

// === API Response Types ===

/** Standard success response */
export type SuccessResponse = { success: true };

/** Standard error response */
export type ErrorResponse = { error: string };

/** Health check response */
export type HealthResponse = { status: "ok"; timestamp: number };

// === Auth Responses ===
export type { User as AuthUser } from "./db/schema";

// === Composite Types (inferred from schema relations) ===
import type { Static, StaticMember, User } from "./db/schema";

/** Member with user details (as returned by drizzle relations) */
export type StaticMemberWithUser = StaticMember & { user: User };

/** Static with members including user details (as returned by drizzle relations) */
export type StaticWithMembers = Static & { members: StaticMemberWithUser[] };
