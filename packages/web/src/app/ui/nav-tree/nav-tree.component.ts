import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../nav.types';
import { IconComponent } from '../primitives';

@Component({
  selector: 'nyct-nav-tree',
  imports: [RouterLink, RouterLinkActive, NavTreeComponent, IconComponent],
  template: `
    @for (item of items(); track item.label) {
      <div class="mb-1">
        @if (item.route && !item.children) {
          <!-- Leaf node with route -->
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-primary-600/20 text-pastel-lavender"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary
                   hover:bg-surface-hover hover:text-text-primary transition-colors"
        [class.justify-center]="collapsed()"
        [attr.title]="collapsed() ? item.label : null"
      >
        @if (item.icon) {
        <nyct-icon [name]="$any(item.icon)" size="md" class="shrink-0" />
        } @if (!collapsed()) {
        <span class="text-sm">{{ item.label }}</span>
        }
      </a>
      } @else if (item.children) {
      <!-- Parent node with children -->
      <div class="relative group">
        <button
          (click)="toggleExpanded(item.label)"
          class="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left
                     text-text-secondary hover:bg-surface-hover hover:text-text-primary
                     transition-colors cursor-pointer"
          [class.justify-center]="collapsed()"
          [attr.title]="collapsed() ? item.label : null"
        >
          @if (item.icon) {
          <nyct-icon [name]="$any(item.icon)" size="md" class="shrink-0" />
          } @if (!collapsed()) {
          <span class="text-sm flex-1">{{ item.label }}</span>
          <nyct-icon
            [name]="isExpanded(item.label) ? 'chevron-down' : 'chevron-right'"
            size="sm"
            class="transition-transform duration-200"
          />
          }
        </button>

        <!-- Flyout menu when collapsed -->
        @if (collapsed() && item.children) {
        <div class="absolute left-full top-0 ml-2 py-2 px-1 min-w-48 bg-surface-elevated border border-border rounded-lg shadow-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
          <div class="px-3 py-1 text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
            {{ item.label }}
          </div>
          @for (child of item.children; track child.label) {
            @if (child.route) {
            <a
              [routerLink]="child.route"
              routerLinkActive="bg-primary-600/20 text-pastel-lavender"
              class="flex items-center gap-2 px-3 py-2 rounded text-sm text-text-secondary
                     hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              {{ child.label }}
            </a>
            } @else if (child.children) {
            <div class="px-3 py-1 text-xs text-text-muted">{{ child.label }}</div>
            @for (subChild of child.children; track subChild.label) {
              @if (subChild.route) {
              <a
                [routerLink]="subChild.route"
                routerLinkActive="bg-primary-600/20 text-pastel-lavender"
                class="flex items-center gap-2 px-3 py-1.5 ml-2 rounded text-sm text-text-secondary
                       hover:bg-surface-hover hover:text-text-primary transition-colors"
              >
                {{ subChild.label }}
              </a>
              }
            }
            }
          }
        </div>
        }
      </div>

      <!-- Children (expanded mode) -->
      @if (!collapsed() && isExpanded(item.label)) {
      <div class="ml-4 pl-4 border-l border-border-subtle">
        <nyct-nav-tree [items]="item.children" [collapsed]="collapsed()" />
      </div>
      } }
    </div>
    }
  `,
})
export class NavTreeComponent {
  items = input<NavItem[]>([]);
  collapsed = input(false);

  private expandedItems = signal<Set<string>>(new Set());

  isExpanded(label: string): boolean {
    return this.expandedItems().has(label);
  }

  toggleExpanded(label: string): void {
    this.expandedItems.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }
}
