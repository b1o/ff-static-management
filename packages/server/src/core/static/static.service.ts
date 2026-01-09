import { and, eq, sql, isNull, lt, or } from "drizzle-orm";
import { db } from "../../db";
import {
	inviteCodes,
	staticMembers,
	statics,
	type NewStaticMember,
} from "../../db/schema";
import { ConflictError, DatabaseError, NotFoundError } from "../../lib/errors";

export type CreateInviteData = {
	staticId: string;
	expiresAt: Date | null;
	maxUses: number | null;
	createdBy: string;
};

export abstract class StaticService {
	static async create(name: string, userId: string) {
		const existingName = await db.query.statics.findFirst({
			where: (s, { eq }) => eq(s.name, name),
		});
		if (existingName) {
			throw new ConflictError("Static name already exists");
		}

		const [newStatic] = await db
			.insert(statics)
			.values({ name })
			.returning();

		if (!newStatic) throw new DatabaseError("Failed to create static");

		await this.addLeader(newStatic.id, userId);

		// Return the static with members (including user data) for frontend consumption
		const staticWithMembers = await this.findByIdWithMembers(newStatic.id);
		if (!staticWithMembers) throw new DatabaseError("Failed to retrieve created static");

		return staticWithMembers;
	}

	/** Internal: Add the creator as leader with canManage: true */
	private static async addLeader(staticId: string, userId: string) {
		const [newMember] = await db
			.insert(staticMembers)
			.values({
				staticId,
				userId,
				role: "leader",
				canManage: true,
			})
			.returning();

		if (!newMember) throw new DatabaseError("Failed to add static leader");
		return newMember;
	}

	static async findById(id: string) {
		return await db.query.statics.findFirst({
			where: (s, { eq }) => eq(s.id, id),
		});
	}

	static async findByIdWithMembers(id: string) {
		return await db.query.statics.findFirst({
			where: (s, { eq }) => eq(s.id, id),
			with: {
				members: {
					with: {
						user: true,
					},
				},
			},
		});
	}

	static async findMember(staticId: string, userId: string) {
		return await db.query.staticMembers.findFirst({
			where: (sm, { eq, and }) => and(eq(sm.staticId, staticId), eq(sm.userId, userId)),
		});
	}

	static async getUsersStatics(userId: string) {
		return await db.query.staticMembers
			.findMany({
				where: (sm, { eq }) => eq(sm.userId, userId),
				with: {
					static: true,
				},
			})
			.then((results) => results.map((r) => r.static));
	}

	static async addMember(data: NewStaticMember) {
		const [newMember] = await db
			.insert(staticMembers)
			.values({
				staticId: data.staticId,
				userId: data.userId,
				canManage: false,
			})
			.onConflictDoNothing()
			.returning();

		if (!newMember) {
			throw new ConflictError("User is already a member of this static");
		}

		return newMember;
	}

	static async removeMember(staticId: string, userId: string) {
		const [deleteResult] = await db
			.delete(staticMembers)
			.where(and(eq(staticMembers.staticId, staticId), eq(staticMembers.userId, userId)))
			.returning();

		if (!deleteResult) {
			throw new NotFoundError("Member not found in this static");
		}
		return deleteResult;
	}

	static async setMemberPermissions(staticId: string, userId: string, canManage: boolean) {
		const [updatedMember] = await db
			.update(staticMembers)
			.set({ canManage })
			.where(and(eq(staticMembers.staticId, staticId), eq(staticMembers.userId, userId)))
			.returning();

		if (!updatedMember) {
			throw new NotFoundError("Member not found in this static");
		}
		return updatedMember;
	}

	static async deleteStatic(staticId: string) {
		const [deleteResult] = await db
			.delete(statics)
			.where(eq(statics.id, staticId))
			.returning();

		if (!deleteResult) {
			throw new NotFoundError("Static not found");
		}
		return deleteResult;
	}

	// ==================== Invitations ====================

	/** Get all invites for a static. Caller must be authorized. */
	static async getStaticInvites(staticId: string) {
		return await db.query.inviteCodes.findMany({
			where: (ic, { eq }) => eq(ic.staticId, staticId),
		});
	}

	/** Generate a new invite code. Caller must be authorized. */
	static async generateInviteCode(data: CreateInviteData) {
		const code = crypto
			.getRandomValues(new Uint8Array(6))
			.reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");

		const [newInvite] = await db
			.insert(inviteCodes)
			.values({
				staticId: data.staticId,
				code,
				expiresAt: data.expiresAt,
				maxUses: data.maxUses,
				createdBy: data.createdBy,
			})
			.returning();

		if (!newInvite) {
			throw new DatabaseError("Failed to generate invite code");
		}
		return newInvite;
	}

	/** Get invite by code (no auth check - use for validation) */
	static async getInviteByCode(code: string) {
		return await db.query.inviteCodes.findFirst({
			where: (ic, { eq }) => eq(ic.code, code),
		});
	}

	/**
	 * Consume an invite code atomically.
	 * Uses atomic increment to prevent race conditions.
	 */
	static async consumeInviteCode(code: string, userId: string) {
		// Atomic update: only succeeds if invite is valid
		const [updatedInvite] = await db
			.update(inviteCodes)
			.set({ uses: sql`${inviteCodes.uses} + 1` })
			.where(
				and(
					eq(inviteCodes.code, code),
					// Check expiration (null = no expiration)
					or(
						isNull(inviteCodes.expiresAt),
						sql`${inviteCodes.expiresAt} > unixepoch('now')`
					),
					// Check max uses (null = unlimited)
					or(
						isNull(inviteCodes.maxUses),
						lt(inviteCodes.uses, inviteCodes.maxUses)
					)
				)
			)
			.returning();

		if (!updatedInvite) {
			// Check if invite exists to give better error
			const invite = await this.getInviteByCode(code);
			if (!invite) {
				throw new NotFoundError("Invite code not found");
			}
			throw new ConflictError("Invite code is no longer valid");
		}

		// Add user as member
		const staticMember = await this.addMember({
			staticId: updatedInvite.staticId,
			userId,
		});

		return { invite: updatedInvite, staticMember };
	}

	/** Delete invite. Verifies invite belongs to the specified static. */
	static async deleteInvite(staticId: string, code: string) {
		const [deleteResult] = await db
			.delete(inviteCodes)
			.where(
				and(
					eq(inviteCodes.code, code),
					eq(inviteCodes.staticId, staticId) // Tenant boundary
				)
			)
			.returning();

		if (!deleteResult) {
			throw new NotFoundError("Invite not found");
		}
		return deleteResult;
	}
}
