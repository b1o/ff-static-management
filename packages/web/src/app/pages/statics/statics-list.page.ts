import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaticsStore } from '../../features/statics/statics.store';
import { IconComponent, AlertComponent } from '../../ui/primitives';
import { HlmButtonImports } from '@spartan/button';
import { HlmCardImports } from '@spartan/card';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { LoadingOverlayComponent } from '../../ui/loading-overlay/loading-overlay.component';

@Component({
  selector: 'nyct-statics-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    IconComponent,
    AlertComponent,
    EmptyStateComponent,
    LoadingOverlayComponent,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-text-primary">My Statics</h1>
          <p class="mt-1 text-sm text-text-secondary">
            Manage your static groups and team members
          </p>
        </div>
        <a hlmBtn routerLink="/statics/new">
          <nyct-icon name="plus" size="sm" />
          Create Static
        </a>
      </div>

      <!-- Error alert -->
      @if (store.error()) {
        <nyct-alert variant="error" class="mb-6" [title]="'Error'">
          {{ store.error() }}
        </nyct-alert>
      }

      <!-- Content area -->
      <div class="relative min-h-[200px]">
        <nyct-loading-overlay [loading]="store.loading()" message="Loading statics..." />

        @if (!store.loading()) {
          @if (store.hasStatics()) {
            <!-- Statics list -->
            <div class="grid gap-4">
              @for (static of store.statics(); track static.id) {
                <a
                  [routerLink]="['/statics', static.id]"
                  class="block group"
                >
                  <section hlmCard class="transition-colors hover:border-primary-500/50">
                    <div hlmCardContent class="p-4">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="p-2 rounded-lg bg-primary-500/10">
                            <nyct-icon name="folder" size="md" class="text-primary-400" />
                          </div>
                          <div>
                            <h3 class="font-medium text-text-primary group-hover:text-primary-400 transition-colors">
                              {{ static.name }}
                            </h3>
                            <p class="text-sm text-text-muted">
                              Created {{ formatDate(static.createdAt) }}
                            </p>
                          </div>
                        </div>
                        <nyct-icon
                          name="chevron-right"
                          size="sm"
                          class="text-text-muted group-hover:text-text-secondary transition-colors"
                        />
                      </div>
                    </div>
                  </section>
                </a>
              }
            </div>
          } @else {
            <!-- Empty state -->
            <nyct-empty-state
              icon="folder"
              title="No statics yet"
              description="Create your first static to start managing your team."
            >
              <a hlmBtn routerLink="/statics/new">
                <nyct-icon name="plus" size="sm" />
                Create Static
              </a>
            </nyct-empty-state>
          }
        }
      </div>
    </div>
  `,
})
export class StaticsListPage implements OnInit {
  protected store = inject(StaticsStore);

  ngOnInit() {
    this.store.loadMyStatics();
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
