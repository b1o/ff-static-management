import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AdminStore } from '../../features/admin/admin.store';
import { ButtonComponent, IconComponent } from '../primitives';

@Component({
  selector: 'nyct-impersonation-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  template: `
    @if (auth.isImpersonating()) {
      <div class="bg-pastel-peach/20 border-b border-pastel-peach/30 px-4 py-2">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2 text-pastel-peach">
            <nyct-icon name="warning" size="sm" />
            <span class="text-sm font-medium">
              Impersonating: {{ auth.user()?.displayName }}
            </span>
          </div>
          <nyct-button
            variant="ghost"
            size="sm"
            class="text-pastel-peach hover:text-pastel-peach/80"
            (click)="exitImpersonation()"
          >
            <nyct-icon name="x" size="sm" />
            Exit Impersonation
          </nyct-button>
        </div>
      </div>
    }
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
