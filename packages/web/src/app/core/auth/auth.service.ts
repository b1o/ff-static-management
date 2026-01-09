import { computed, inject, Injectable, signal } from '@angular/core';
import { API, API_URL, User } from '../api/api';
import { apiCall } from '../api/api.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(API);
  public user = signal<User | null>(null);
  public isImpersonating = signal<boolean>(false);

  /** Check if current user is an admin */
  public isAdmin = computed(() => this.user()?.isAdmin ?? false);

  public async login() {
    const response = await apiCall(() => this.api.auth.discord.get());
    if (response.success) {
      window.location.href = response.data.url;
    }
  }

  public async me() {
    const result = await this.api.auth.me.get();
    if (result.data?.user) {
      this.user.set(result.data.user);
      this.isImpersonating.set(result.data.isImpersonating ?? false);
    }
    return result;
  }

  public async logout() {
    await this.api.auth.logout.post();
    this.user.set(null);
    this.isImpersonating.set(false);
    window.location.reload();
  }
}
