import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ImpersonationBannerComponent } from '../impersonation-banner/impersonation-banner';

@Component({
  selector: 'nyct-layout',
  imports: [RouterOutlet, SidebarComponent, ImpersonationBannerComponent],
  template: `
    <div class="flex flex-col h-full">
      <nyct-impersonation-banner />
      <div class="flex flex-1 overflow-hidden">
        <nyct-sidebar />
        <main class="flex-1 overflow-auto bg-dark-950 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {}
