import { Component, computed, inject, signal } from '@angular/core';
import { NavTreeComponent } from '../nav-tree/nav-tree.component';
import { UserInfoComponent } from '../user-info/user-info.component';
import { NavItem } from '../nav.types';
import { AuthService } from '../../core/auth/auth.service';
import { getUserAvatarUrl } from '../../utils/utils';
import { ButtonComponent, IconButtonComponent, IconComponent } from '../primitives';
import { StaticsStore } from '../../features/statics/statics.store';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'nyct-sidebar',
  imports: [NavTreeComponent, UserInfoComponent, ButtonComponent, IconButtonComponent],
  template: `
    <aside
      class="flex flex-col h-full bg-surface border-r border-border transition-all duration-200"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
      [class.overflow-visible]="collapsed()"
    >
      <!-- User info section -->
      <div
        class="p-4 border-b border-border-subtle flex items-center"
        [class.justify-between]="!collapsed()"
        [class.justify-center]="collapsed()"
      >
        <nyct-user-info [info]="userInfo()" [collapsed]="collapsed()" />
        @if (!collapsed()) {
        <nyct-button variant="ghost" size="sm" (click)="auth.logout()">Logout</nyct-button>
        }
      </div>

      <!-- Navigation section -->
      <nav
        class="flex-1 p-2"
        [class.overflow-y-auto]="!collapsed()"
        [class.overflow-visible]="collapsed()"
      >
        <nyct-nav-tree [items]="navItems()" [collapsed]="collapsed()" />
      </nav>

      <!-- Theme toggle and collapse -->
      <div
        class="p-2 border-t border-border-subtle flex"
        [class.flex-col]="collapsed()"
        [class.items-center]="collapsed()"
        [class.gap-1]="collapsed()"
        [class.justify-between]="!collapsed()"
      >
        <nyct-icon-button
          [icon]="collapsed() ? 'chevron-right' : 'chevron-left'"
          variant="ghost"
          [size]="collapsed() ? 'sm' : 'md'"
          [ariaLabel]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          (click)="collapsed.set(!collapsed())"
        />
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  collapsed = signal(false);
  auth = inject(AuthService);
  staticStore = inject(StaticsStore);

  protected userInfo = computed(() => {
    const user = this.auth.user();
    if (user) {
      return {
        name: user.displayName,
        subtitle: `@${user.username}`,
        avatarUrl: getUserAvatarUrl(user.discordId, user.avatar, 'test'),
      };
    }
    return undefined;
  });

  protected navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        label: 'Dashboard',
        icon: 'home',
        route: '/dashboard',
      },
      {
        label: 'Statics',
        icon: 'folder',
        children: [
          {
            label: 'My Statics',
            route: '/statics',
            children: [
              ...(this.staticStore.statics().length !== 1
                ? [{ label: 'All Statics', route: '/statics' }]
                : []),
              ...this.staticStore
                .statics()
                .map((s) => ({ label: s.name, route: `/statics/${s.id}` })),
            ],
          },
          { label: 'Create New', route: '/statics/new' },
        ],
      },
      {
        label: 'Characters',
        icon: 'users',
        route: '/characters',
      },
      {
        label: 'Settings',
        icon: 'cog',
        route: '/settings',
      },
    ];

    // Add admin section if user is admin
    if (this.auth.isAdmin()) {
      items.push({
        label: 'Admin',
        icon: 'cog',
        route: '/admin',
      });
    }

    return items;
  });
}
