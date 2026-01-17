import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarImports } from '@spartan/sidebar';
import { AppSidebarComponent } from './app-sidebar.component';
import { ImpersonationBannerComponent } from '../impersonation-banner/impersonation-banner';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'nyct-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HlmSidebarImports, AppSidebarComponent, ImpersonationBannerComponent],
  template: `
    <div hlmSidebarWrapper>
      <nyct-app-sidebar />
      <main hlmSidebarInset class="flex flex-col">
        @if (auth.isImpersonating()) {
          <nyct-impersonation-banner />
        }
        <div class="flex-1 overflow-auto p-6">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
}
