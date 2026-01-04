import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { staticMembers, statics, type NewStaticMember, type StaticMember } from "../../db/schema";
import { ConfilictError, DatabaseError } from "../../lib/errors";

export abstract class StaticService {
	static async create(name: string, userId: string) {
		const existingName = await db.query.statics.findFirst({
			where: (s, { eq }) => eq(s.name, name),
		});
		if (existingName) {
			throw new ConfilictError("Static name already exists");
		}

		const [newStatic] = await db
			.insert(statics)
			.values({
				name: name,
			})
			.returning();
		if (!newStatic) throw new DatabaseError("Failed to create static");
		const leader = await this.addMember({
			staticId: newStatic.id,
			userId: userId,
			role: "leader",
		});
		return { newStatic, leader };
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
				members: true,
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
				where: (sm, { eq }) => eq(sm.userId, userId) && eq(sm.canManage, true),
				with: {
					static: true,
				},
			})
			.then((results) => results.map((r) => r.static));
	}

	static async addMember(data: NewStaticMember) {
		const existingMember = await db.query.staticMembers.findFirst({
			where: (cm, { eq, and }) => and(eq(cm.staticId, data.staticId), eq(cm.userId, data.userId)),
		});

		if (existingMember) {
			throw new ConfilictError("User is already a member of this static");
		}

		const [newMember] = await db
			.insert(staticMembers)
			.values({
				staticId: data.staticId,
				userId: data.userId,
				role: data.role,
				canManage: data.role === "leader",
			})
			.returning();

		if (!newMember) throw new DatabaseError("Failed to add static member");

		return newMember;
	}

	static async removeMember(staticId: string, userId: string) {
		const [deleteResult] = await db
			.delete(staticMembers)
			.where(and(eq(staticMembers.staticId, staticId), eq(staticMembers.userId, userId)))
			.returning();
		if (!deleteResult) {
			throw new DatabaseError("Failed to remove static member or member does not exist");
		}
		return deleteResult;
	}

	static async updateMemberRole(staticId: string, userId: string, role: "leader" | "member") {
		const [updatedMember] = await db
			.update(staticMembers)
			.set({ role, canManage: role === "leader" })
			.where(and(eq(staticMembers.staticId, staticId), eq(staticMembers.userId, userId)))
			.returning();
		if (!updatedMember) {
			throw new DatabaseError("Failed to update static member role or member does not exist");
		}
		return updatedMember;
	}

	static async deleteStatic(staticId: string, userId: string) {
		const staticLeader = await db.query.staticMembers.findFirst({
			where: (sm, { eq }) => eq(sm.staticId, staticId) && eq(sm.role, "leader"),
		});

		if (!staticLeader || staticLeader.userId !== userId) {
			throw new ConfilictError("Only the static leader can delete the static");
		}

		const [deleteResult] = await db.delete(statics).where(eq(statics.id, staticId)).returning();
		if (!deleteResult) {
			throw new DatabaseError("Failed to delete static or static does not exist");
		}
		return deleteResult;
	}
}
