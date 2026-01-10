import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  computed,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StaticsStore } from '../../features/statics/statics.store';
import { DialogService } from '../../ui/dialog';
import { AuthService } from '../../core/auth/auth.service';
import {
  ButtonComponent,
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  IconComponent,
  AlertComponent,
  BadgeComponent,
} from '../../ui/primitives';
import { IfLeaderDirective, IfCanManageDirective } from '../../utils/permission.directive';
import { LoadingOverlayComponent } from '../../ui/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { StaticInviteDialogComponent } from './static-invite.dialog';
import type { StaticMember, User } from '@ff-static/api/types';
import { takeUntil, tap } from 'rxjs';

// Extended type for member with user data (as returned by backend)
type MemberWithUser = StaticMember & { user: User };

@Component({
  selector: 'nyct-statics-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    IconComponent,
    AlertComponent,
    BadgeComponent,
    LoadingOverlayComponent,
    EmptyStateComponent,
    IfLeaderDirective,
    IfCanManageDirective,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Back link -->
      <a
        routerLink="/statics"
        class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <nyct-icon name="chevron-left" size="sm" />
        Back to Statics
      </a>

      <!-- Error alert -->
      @if (store.error()) {
      <nyct-alert variant="error" class="mb-6" [title]="'Error'">
        {{ store.error() }}
      </nyct-alert>
      }

      <!-- Content area -->
      <div class="relative min-h-75">
        <nyct-loading-overlay [loading]="store.loading()" message="Loading static..." />

        @if (!store.loading() && store.selectedStatic(); as static) {
        <!-- Static Header -->
        <nyct-card class="mb-6">
          <nyct-card-content class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-xl bg-primary-500/10">
                  <nyct-icon name="folder" size="lg" class="text-primary-400" />
                </div>
                <div>
                  <h1 class="text-2xl font-semibold text-text-primary">
                    {{ static.name }}
                  </h1>
                  <p class="mt-1 text-sm text-text-secondary">
                    Created {{ formatDate(static.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="controls flex items-center gap-3">
                <nyct-button
                  *nyctIfCanManage
                  variant="secondary"
                  size="sm"
                  (click)="handleInvite()"
                >
                  Invite
                </nyct-button>

                <nyct-button *nyctIfLeader variant="danger" size="sm" (click)="handleDelete()">
                  <nyct-icon name="trash" size="sm" />
                  Delete
                </nyct-button>
              </div>
            </div>
          </nyct-card-content>
        </nyct-card>

        <!-- Members Section -->
        <nyct-card>
          <nyct-card-header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-text-primary">Members</h2>
                <p class="mt-1 text-sm text-text-secondary">
                  {{ membersWithUsers().length }} member{{
                    membersWithUsers().length === 1 ? '' : 's'
                  }}
                </p>
              </div>
            </div>
          </nyct-card-header>

          <nyct-card-content class="p-0">
            @if (membersWithUsers().length > 0) {
            <ul class="divide-y divide-border">
              @for (member of membersWithUsers(); track member.id) {
              <li class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <!-- Avatar -->
                  @if (member.user.avatar) {
                  <img
                    [src]="getAvatarUrl(member.user)"
                    [alt]="member.user.displayName"
                    class="w-10 h-10 rounded-full"
                  />
                  } @else {
                  <div
                    class="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center"
                  >
                    <span class="text-sm font-medium text-primary-400">
                      {{ member.user.displayName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  }

                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-text-primary">
                        {{ member.user.displayName }}
                      </span>
                      @if (member.role === 'leader') {
                      <nyct-badge variant="info" size="sm">Leader</nyct-badge>
                      } @else if (member.canManage) {
                      <nyct-badge variant="success" size="sm">Manager</nyct-badge>
                      } @if (member.userId === currentUser()?.id) {
                      <nyct-badge variant="default" size="sm">You</nyct-badge>
                      }
                    </div>
                    <span class="text-sm text-text-muted">
                      {{ member.user.username }}
                    </span>
                  </div>
                </div>

                <ng-container *nyctIfCanManage>
                  @if (member.userId !== currentUser()?.id && member.role !== 'leader') {
                  <div class="flex items-center gap-2">
                    <!-- Toggle manager permission -->
                    <button
                      type="button"
                      [title]="member.canManage ? 'Revoke manager' : 'Make manager'"
                      (click)="toggleManagerPermission(member)"
                      class="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      <nyct-icon [name]="member.canManage ? 'minus' : 'plus'" size="sm" />
                    </button>

                    <!-- Remove member -->
                    <button
                      type="button"
                      title="Remove member"
                      (click)="handleRemoveMember(member)"
                      class="p-2 rounded-lg text-text-secondary hover:text-pastel-rose hover:bg-pastel-rose/10 transition-colors"
                    >
                      <nyct-icon name="trash" size="sm" />
                    </button>
                  </div>
                  }
                </ng-container>
              </li>
              }
            </ul>
            } @else {
            <nyct-empty-state
              icon="user"
              title="No members"
              description="This static doesn't have any members yet."
            />
            }
          </nyct-card-content>
        </nyct-card>
        } @if (!store.loading() && !store.selectedStatic() && !store.error()) {
        <nyct-empty-state
          icon="folder"
          title="Static not found"
          description="The requested static could not be found."
        >
          <nyct-button routerLink="/statics"> Go to Statics </nyct-button>
        </nyct-empty-state>
        }
      </div>
    </div>
  `,
})
export class StaticsDetailPage implements OnInit, OnDestroy {
  protected store = inject(StaticsStore);
  protected authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);

  protected currentUser = this.authService.user;

  protected membersWithUsers = computed(() => {
    const staticData = this.store.selectedStatic();
    if (!staticData) return [];
    return staticData.members;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        tap((params) => {
          const id = params.get('id');
          if (id) {
            this.store.loadStatic(id);
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }
  ngOnInit() {}

  ngOnDestroy() {
    this.store.clearSelectedStatic();
    this.store.clearError();
  }

  async handleInvite() {
    const staticData = this.store.selectedStatic();
    if (!staticData) return;

    await this.dialog.open(StaticInviteDialogComponent, {
      data: {
        staticId: staticData.id,
        staticName: staticData.name,
      },
    });
  }

  async handleDelete() {
    const staticData = this.store.selectedStatic();
    if (!staticData) return;

    const confirmed = await this.dialog.confirm({
      title: 'Delete Static',
      message: `Are you sure you want to delete "${staticData.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      const success = await this.store.deleteStatic(staticData.id);
      if (success) {
        this.router.navigate(['/statics']);
      }
    }
  }

  async handleRemoveMember(member: MemberWithUser) {
    const confirmed = await this.dialog.confirm({
      title: 'Remove Member',
      message: `Are you sure you want to remove ${member.user.displayName} from this static?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      await this.store.removeMember(member.userId);
    }
  }

  async toggleManagerPermission(member: MemberWithUser) {
    await this.store.updateMemberPermissions(member.userId, !member.canManage);
  }

  formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getAvatarUrl(user: User): string {
    if (!user.avatar) return '';
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=64`;
  }
}
