import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HlmSidebarImports, HlmSidebarService } from '@spartan/sidebar';
import { HlmButtonImports } from '@spartan/button';
import { AuthService } from '../../core/auth/auth.service';
import { StaticsStore } from '../../features/statics/statics.store';
import { NavUserComponent } from './nav-user.component';
import { NavMainComponent } from './nav-main.component';
import { NavItem } from '../nav.types';

@Component({
  selector: 'nyct-app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmSidebarImports, HlmButtonImports, NavUserComponent, NavMainComponent],
  template: `
    <hlm-sidebar collapsible="icon" class="h-full">
      <div hlmSidebarHeader class="border-b border-sidebar-border">
        <nyct-nav-user />
      </div>

      <div hlmSidebarContent>
        <nyct-nav-main [items]="navItems()" />
      </div>

      <div hlmSidebarFooter class="border-t border-sidebar-border">
        <button hlmSidebarTrigger aria-label="Toggle sidebar"></button>
      </div>

      <div hlmSidebarRail></div>
    </hlm-sidebar>
  `,
})
export class AppSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly staticStore = inject(StaticsStore);
  protected readonly sidebarService = inject(HlmSidebarService);

  protected readonly navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        label: 'Dashboard',
        icon: 'lucideHome',
        route: '/dashboard',
      },
      {
        label: 'Statics',
        icon: 'lucideFolder',
        route: '/statics',
        children: [...this.buildStaticsChildren(), { label: 'Create New', route: '/statics/new' }],
      },
      {
        label: 'Characters',
        icon: 'lucideUsers',
        route: '/characters',
      },
      {
        label: 'Settings',
        icon: 'lucideSettings',
        route: '/settings',
      },
    ];

    if (this.auth.isAdmin()) {
      items.push({
        label: 'Admin',
        icon: 'lucideSettings',
        route: '/admin',
      });
    }

    return items;
  });

  private buildStaticsChildren(): NavItem[] {
    const statics = this.staticStore.statics();
    const children: NavItem[] = [];

    for (const s of statics) {
      children.push({ label: s.name, route: `/statics/${s.id}` });
    }

    return children;
  }
}
