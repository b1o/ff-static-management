import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AdminStore } from '../../features/admin/admin.store';
import { HlmButtonImports } from '@spartan/button';
import { HlmAlertImports } from '@spartan/alert';
import { HlmBadgeImports } from '@spartan/badge';
import { HlmIconImports } from '@spartan/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'nyct-impersonation-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideTriangleAlert, lucideX })],
  imports: [HlmButtonImports, HlmAlertImports, HlmBadgeImports, HlmIconImports],
  template: `
    <div
      hlmAlert
      variant="destructive"
      class="rounded-none items-center border-x-0 border-t-0 flex max-h-xs flex-row relative"
    >
      <ng-icon hlm hlmAlertIcon name="lucideTriangleAlert" />
      <h4 hlmAlertTitle class="flex items-center gap-2">
        <span hlmBadge variant="destructive">Impersonating</span>
        <span>{{ auth.user()?.displayName }}</span>
      </h4>
      <div hlmAlertDesc class="flex items-center justify-between">
        <span class="text-xs">You are viewing the app as this user.</span>
        <button
          class="absolute top-5 right-5 text-destructive"
          variant="ghost"
          hlmBtn
          size="icon-xs"
          (click)="exitImpersonation()"
        >
          <ng-icon hlm name="lucideX" size="sm" />
        </button>
      </div>
    </div>
  `,
})
export class ImpersonationBannerComponent {
  protected auth = inject(AuthService);
  private adminStore = inject(AdminStore);

  async exitImpersonation() {
    const success = await this.adminStore.unimpersonate();
    if (success) {
      // Reload the page to reset app state
      window.location.href = '/admin';
    }
  }
}
