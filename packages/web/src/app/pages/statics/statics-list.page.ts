import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaticsStore } from '../../features/statics/statics.store';
import { HlmButtonImports } from '@spartan/button';
import { HlmCardImports } from '@spartan/card';
import { HlmItemImports } from '@spartan/item';
import { HlmIconImports } from '@spartan/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideSquareArrowOutUpRight, lucideTrash } from '@ng-icons/lucide';
import { User } from '@ff-static/api/schema';
import { StaticWithMembers } from '@ff-static/api/types';
import { HlmAvatarImports } from '@spartan/avatar';
import { discordAvatarUrl, getUserAvatarUrl } from 'src/app/utils/utils';
import { HlmHoverCardImports } from '@spartan/hover-card';
import { BrnHoverCardImports } from '@spartan-ng/brain/hover-card';
import { DatePipe } from '@angular/common';
import { BrnDialogService } from '@spartan-ng/brain/dialog';
import { StaticsCreatePage } from './statics-create.page';
import { HlmDialogService } from '@spartan/dialog';

@Component({
  selector: 'nyct-statics-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideTrash,
      lucideSquareArrowOutUpRight,
    }),
  ],
  imports: [
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmItemImports,
    HlmIconImports,
    BrnHoverCardImports,
    HlmHoverCardImports,
    HlmAvatarImports,
    DatePipe,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-text-primary">My Statics</h1>
          <p class="mt-1 text-sm text-text-secondary">Manage your static groups and team members</p>
        </div>
        <button hlmBtn (click)="openCreateStatic()">Create Static</button>
      </div>

      <!-- Content area -->
      <div class="relative min-h-50">
        @if (!store.loading()) {
          @if (store.hasStatics()) {
            <!-- Statics list -->
            <div class="grid gap-4">
              @for (static of store.statics(); track static.id) {
                <div
                  hlmItem
                  variant="outline"
                  class="justify-between"
                  routerLink="/statics/{{ static.id }}"
                >
                  <div hlmItemContent>
                    <h3 class="text-lg font-medium text-text-primary">{{ static.name }}</h3>
                    <p class="text-sm text-text-secondary">
                      Created on {{ formatDate(static.createdAt) }}
                    </p>
                  </div>

                  <div hlmItemMedia>
                    <div class="flex -space-x-2">
                      @for (member of static.members; track $index) {
                        <brn-hover-card>
                          <hlm-avatar
                            brnHoverCardTrigger
                            showDelay="100"
                            hideDelay="10"
                            class="hover:z-10 hover:scale-150 transition-all"
                          >
                            <img
                              hlmAvatarImage
                              [src]="discordAvatar(member.user)"
                              [alt]="static.name"
                            />
                            <span hlmAvatarFallback>{{ member.user.displayName.charAt(0) }}</span>
                          </hlm-avatar>
                          <hlm-hover-card-content *brnHoverCardContent class="w-50">
                            <div class="flex items-center justify-center flex-col">
                              <p class="text-sm text-text-secondary">@{{ member.user.username }}</p>
                              <span class="text-muted-foreground text-xs">{{
                                member.joinedAt | date: 'MMMM yyyy'
                              }}</span>
                            </div>
                          </hlm-hover-card-content>
                        </brn-hover-card>
                      }
                    </div>
                  </div>

                  <div hlmItemActions>
                    <button hlmBtn variant="outline" class="text-destructive" size="icon-sm">
                      <ng-icon hlm name="lucideTrash" size="sm" />
                    </button>
                    <button
                      routerLink="/statics/{{ static.id }}"
                      hlmBtn
                      variant="outline"
                      class="text-primary"
                      size="icon-sm"
                    >
                      <ng-icon hlm name="lucideSquareArrowOutUpRight" size="sm" />
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Empty state -->
          }
        }
      </div>
    </div>
  `,
})
export class StaticsListPage implements OnInit {
  protected store = inject(StaticsStore);
  private dialogService = inject(HlmDialogService);

  ngOnInit() {}

  getUsersFromStatic(s: StaticWithMembers) {
    return s.members?.map((member) => member.user) || [];
  }

  discordAvatar(user: User) {
    if (user.avatar) {
      return discordAvatarUrl(user.discordId, user.avatar);
    }
    return '';
  }

  getMembersAvatarUrls(s: StaticWithMembers): (string | undefined)[] {
    return (
      s.members?.map((member) => {
        const a = getUserAvatarUrl(member.user.discordId, member.user.avatar, '550');
        console.log('avatar url', a);
        return a;
      }) || []
    );
  }
  openCreateStatic() {
    const ref = this.dialogService.open(StaticsCreatePage, {
      contentClass: `sm:!max-w=[750px] min-w-[600px]`,
    });

    ref.closed$.subscribe((result) => {
      if (result === 'created') {
        this.store.loadMyStatics();
      }
    });
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
