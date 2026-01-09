import { inject, Injectable } from '@angular/core';
import { API } from '../../core/api/api';
import { apiCall, ApiResult } from '../../core/api/api.utils';
import type { Static, StaticMember, InviteCode, StaticWithMembers } from '@ff-static/api/types';

// Re-export for consumers of this service
export type { StaticWithMembers } from '@ff-static/api/types';

@Injectable({ providedIn: 'root' })
export class StaticsService {
  private api = inject(API);

  /** Get all statics for the current user */
  async getMyStatics(): Promise<ApiResult<Static[]>> {
    const result = await apiCall(() => this.api.statics['my-statics'].get());
    if (result.success) {
      return { success: true, data: result.data.statics.filter((s) => s !== null) as Static[] };
    }
    return result;
  }

  /** Get a single static by ID with members */
  async getStatic(id: string): Promise<ApiResult<StaticWithMembers>> {
    const result = await apiCall(() => this.api.statics({ staticId: id }).get());
    if (result.success && result.data.static) {
      return { success: true, data: result.data.static as StaticWithMembers };
    }
    return { success: false, error: 'Static not found' };
  }

  /** Create a new static */
  async createStatic(name: string): Promise<ApiResult<StaticWithMembers>> {
    const result = await apiCall(() => this.api.statics.create.post({ name }));
    if (result.success && result.data.static) {
      return { success: true, data: result.data.static as StaticWithMembers };
    }
    return { success: false, error: result.success ? 'Failed to create static' : result.error };
  }

  /** Delete a static (leader only) */
  async deleteStatic(id: string): Promise<ApiResult<void>> {
    const result = await apiCall(() => this.api.statics({ staticId: id }).delete());
    if (result.success) {
      return { success: true, data: undefined };
    }
    return result;
  }

  /** Get members of a static */
  async getMembers(staticId: string): Promise<ApiResult<StaticMember[]>> {
    const result = await apiCall(() => this.api.statics({ staticId }).members.get());
    if (result.success) {
      return { success: true, data: result.data.members };
    }
    return result;
  }

  /** Remove a member from a static (manager only) */
  async removeMember(staticId: string, userId: string): Promise<ApiResult<void>> {
    const result = await apiCall(() => this.api.statics({ staticId }).members({ userId }).delete());
    if (result.success) {
      return { success: true, data: undefined };
    }
    return result;
  }

  /** Update member permissions (manager only) */
  async updateMemberPermissions(
    staticId: string,
    userId: string,
    canManage: boolean
  ): Promise<ApiResult<StaticMember>> {
    const result = await apiCall(() =>
      this.api.statics({ staticId }).members.role.patch({ userId, canManage })
    );
    if (result.success) {
      return { success: true, data: result.data.updatedMember };
    }
    return result;
  }

  async getInviteCodes(staticId: string): Promise<ApiResult<InviteCode[]>> {
    const result = await apiCall(() => this.api.statics({ staticId }).invites.get());
    if (result.success) {
      return { success: true, data: result.data.invites };
    }
    return result;
  }

  async generateInviteLink(staticId: string, expiresAt: Date | null, maxUses: number | null) {
    const result = await apiCall(() =>
      this.api.statics({ staticId }).invite.post({
        expiresAt,
        maxUses,
      })
    );
    return result;
  }

  async deleteInvite(staticId: string, code: string): Promise<ApiResult<void>> {
    const result = await apiCall(() => this.api.statics({ staticId }).invite({ code }).delete());
    if (result.success) {
      return { success: true, data: undefined };
    }
    return result;
  }
}
