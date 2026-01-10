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
          >
            @if (item.icon) {
              <nyct-icon [name]="$any(item.icon)" size="md" class="shrink-0" />
            }
            @if (!collapsed()) {
              <span class="text-sm">{{ item.label }}</span>
            }
          </a>
        } @else if (item.children) {
          <!-- Parent node with children -->
          <button
            (click)="toggleExpanded(item.label)"
            class="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left
                   text-text-secondary hover:bg-surface-hover hover:text-text-primary
                   transition-colors cursor-pointer"
            [class.justify-center]="collapsed()"
          >
            @if (item.icon) {
              <nyct-icon [name]="$any(item.icon)" size="md" class="shrink-0" />
            }
            @if (!collapsed()) {
              <span class="text-sm flex-1">{{ item.label }}</span>
              <nyct-icon
                [name]="isExpanded(item.label) ? 'chevron-down' : 'chevron-right'"
                size="sm"
                class="transition-transform duration-200"
              />
            }
          </button>

          <!-- Children -->
          @if (!collapsed() && isExpanded(item.label)) {
            <div class="ml-4 pl-4 border-l border-border-subtle">
              <nyct-nav-tree [items]="item.children" [collapsed]="collapsed()" />
            </div>
          }
        }
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
