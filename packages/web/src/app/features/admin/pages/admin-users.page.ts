import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AdminStore } from '../admin.store';
import { AuthService } from '../../../core/auth/auth.service';
import {
  IconComponent,
  AlertComponent,
  BadgeComponent,
} from '../../../ui/primitives';
import { HlmButtonImports } from '@spartan/button';
import { HlmCardImports } from '@spartan/card';
import { LoadingOverlayComponent } from '../../../ui/loading-overlay/loading-overlay.component';

@Component({
  selector: 'nyct-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports,
    HlmCardImports,
    IconComponent,
    AlertComponent,
    BadgeComponent,
    LoadingOverlayComponent,
  ],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-text-primary">Admin Panel</h1>
        <p class="mt-1 text-sm text-text-secondary">
          Manage users and impersonate for testing
        </p>
      </div>

      <!-- Error alert -->
      @if (store.error()) {
        <nyct-alert variant="error" class="mb-6" [title]="'Error'">
          {{ store.error() }}
        </nyct-alert>
      }

      <!-- Content area -->
      <div class="relative min-h-[200px]">
        <nyct-loading-overlay [loading]="store.loading()" message="Loading users..." />

        @if (!store.loading()) {
          <section hlmCard>
            <div hlmCardContent class="p-0">
              <table class="w-full">
                <thead class="bg-surface-elevated border-b border-border">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      User
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Discord ID
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Created
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  @for (user of store.users(); track user.id) {
                    <tr class="hover:bg-surface-elevated/50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          @if (user.avatar) {
                            <img
                              [src]="getAvatarUrl(user.discordId, user.avatar)"
                              [alt]="user.displayName"
                              class="w-8 h-8 rounded-full"
                            />
                          } @else {
                            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                              <nyct-icon name="user" size="sm" class="text-primary-400" />
                            </div>
                          }
                          <div>
                            <div class="font-medium text-text-primary">{{ user.displayName }}</div>
                            <div class="text-sm text-text-muted">&#64;{{ user.username }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-sm text-text-secondary font-mono">
                        {{ user.discordId }}
                      </td>
                      <td class="px-4 py-3">
                        @if (user.isAdmin) {
                          <nyct-badge variant="info">Admin</nyct-badge>
                        } @else {
                          <nyct-badge variant="default">User</nyct-badge>
                        }
                      </td>
                      <td class="px-4 py-3 text-sm text-text-secondary">
                        {{ formatDate(user.createdAt) }}
                      </td>
                      <td class="px-4 py-3 text-right">
                        @if (user.id !== auth.user()?.id && !auth.isImpersonating()) {
                          <button
                            hlmBtn
                            variant="ghost"
                            size="sm"
                            (click)="impersonate(user.id)"
                          >
                            <nyct-icon name="user" size="sm" />
                            Impersonate
                          </button>
                        } @else if (user.id === auth.user()?.id) {
                          <span class="text-sm text-text-muted">(You)</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="px-4 py-8 text-center text-text-muted">
                        No users found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export class AdminUsersPage implements OnInit {
  protected store = inject(AdminStore);
  protected auth = inject(AuthService);

  ngOnInit() {
    this.store.loadUsers();
  }

  getAvatarUrl(discordId: string, avatar: string): string {
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`;
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async impersonate(userId: string) {
    const success = await this.store.impersonate(userId);
    if (success) {
      // Reload the page to reset app state with new user
      window.location.href = '/dashboard';
    }
  }
}
