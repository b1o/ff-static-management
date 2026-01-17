import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown, lucideLogOut } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan/avatar';
import { HlmDropdownMenuImports } from '@spartan/dropdown-menu';
import { HlmIconImports } from '@spartan/icon';
import { HlmSidebarImports } from '@spartan/sidebar';
import { AuthService } from '../../core/auth/auth.service';
import { getUserAvatarUrl } from '../../utils/utils';

@Component({
  selector: 'nyct-nav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkMenuTrigger,
    HlmSidebarImports,
    HlmAvatarImports,
    HlmDropdownMenuImports,
    HlmIconImports,
  ],
  providers: [provideIcons({ lucideChevronsUpDown, lucideLogOut })],
  template: `
    <ul hlmSidebarMenu>
      <li hlmSidebarMenuItem>
        <button
          hlmSidebarMenuButton
          size="lg"
          [cdkMenuTriggerFor]="userMenu"
          class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <hlm-avatar class="size-8 rounded-lg">
            @if (avatarUrl()) {
              <img hlmAvatarImage [src]="avatarUrl()" [alt]="displayName()" />
            }
            <span hlmAvatarFallback class="rounded-lg">{{ initials() }}</span>
          </hlm-avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{ displayName() }}</span>
            <span class="truncate text-xs text-muted-foreground">{{ username() }}</span>
          </div>
          <ng-icon hlm name="lucideChevronsUpDown" size="sm" class="ml-auto" />
        </button>

        <ng-template #userMenu>
          <hlm-dropdown-menu class="w-56 rounded-lg" align="end" side="bottom">
            <div hlmDropdownMenuGroup>
              <button hlmDropdownMenuItem (click)="logout()">
                <ng-icon hlm name="lucideLogOut" size="sm" class="mr-2" />
                Log out
              </button>
            </div>
          </hlm-dropdown-menu>
        </ng-template>
      </li>
    </ul>
  `,
})
export class NavUserComponent {
  private readonly auth = inject(AuthService);

  protected readonly displayName = computed(() => this.auth.user()?.displayName ?? 'User');
  protected readonly username = computed(() => `@${this.auth.user()?.username ?? ''}`);
  protected readonly avatarUrl = computed(() => {
    const user = this.auth.user();
    if (user) {
      return getUserAvatarUrl(user.discordId, user.avatar, 'test');
    }
    return undefined;
  });
  protected readonly initials = computed(() => {
    const name = this.displayName();
    return name.charAt(0).toUpperCase();
  });

  protected logout(): void {
    this.auth.logout();
  }
}
