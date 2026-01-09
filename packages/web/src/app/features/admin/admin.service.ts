import { inject, Injectable } from '@angular/core';
import { API } from '../../core/api/api';
import { apiCall, ApiResult } from '../../core/api/api.utils';
import type { User } from '@ff-static/api/types';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(API);

  /** Get all users (admin only) */
  async getUsers(): Promise<ApiResult<User[]>> {
    const result = await apiCall(() => this.api.admin.users.get());
    if (result.success) {
      return { success: true, data: result.data.users as User[] };
    }
    return result;
  }

  /** Impersonate a user (admin only) */
  async impersonate(userId: string): Promise<ApiResult<{ id: string; username: string; displayName: string }>> {
    const result = await apiCall(() => this.api.admin.impersonate({ userId }).post());
    if (result.success) {
      return { success: true, data: result.data.impersonating };
    }
    return result;
  }

  /** Stop impersonating and restore admin session */
  async unimpersonate(): Promise<ApiResult<{ id: string; username: string; displayName: string }>> {
    const result = await apiCall(() => this.api.admin.unimpersonate.post());
    if (result.success) {
      return { success: true, data: result.data.user };
    }
    return result;
  }
}
