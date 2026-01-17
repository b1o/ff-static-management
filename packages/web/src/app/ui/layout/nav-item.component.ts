import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { BrnCollapsibleImports } from '@spartan-ng/brain/collapsible';
import { HlmCollapsibleImports } from '@spartan/collapsible';
import { HlmIconImports } from '@spartan/icon';
import { HlmSidebarImports } from '@spartan/sidebar';
import { NavItem } from '../nav.types';

@Component({
  selector: 'nyct-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    HlmSidebarImports,
    HlmCollapsibleImports,
    BrnCollapsibleImports,
    HlmIconImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideChevronRight })],
  template: `
    @if (isTopLevel()) {
      <!-- Top-level items -->
      @if (item().children) {
        <li
          hlmSidebarMenuItem
          hlmCollapsible
          [expanded]="expanded()"
          (expandedChange)="onExpandedChange($event)"
          class="group/collapsible"
        >
          @if (item().route) {
            <a
              hlmSidebarMenuButton
              [routerLink]="item().route"
              routerLinkActive
              #rla="routerLinkActive"
              [isActive]="rla.isActive"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="expand()"
            >
              @if (item().icon) {
                <ng-icon hlm [name]="item().icon!" size="sm" />
              }
              <span>{{ item().label }}</span>
              <ng-icon
                hlm
                name="lucideChevronRight"
                size="sm"
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
              />
            </a>
          } @else {
            <button hlmSidebarMenuButton hlmCollapsibleTrigger>
              @if (item().icon) {
                <ng-icon hlm [name]="item().icon!" size="sm" />
              }
              <span>{{ item().label }}</span>
              <ng-icon
                hlm
                name="lucideChevronRight"
                size="sm"
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
              />
            </button>
          }
          <ul hlmCollapsibleContent hlmSidebarMenuSub>
            @for (child of item().children; track child.label) {
              <nyct-nav-item
                [item]="child"
                [depth]="depth() + 1"
                [expandedItems]="expandedItems()"
                (expandedItemsChange)="expandedItemsChange.emit($event)"
              />
            }
          </ul>
        </li>
      } @else {
        <li hlmSidebarMenuItem>
          <a
            hlmSidebarMenuButton
            [routerLink]="item().route"
            routerLinkActive
            #rla="routerLinkActive"
            [isActive]="rla.isActive"
            [routerLinkActiveOptions]="{ exact: true }"
            [tooltip]="item().label"
          >
            @if (item().icon) {
              <ng-icon hlm [name]="item().icon!" size="sm" />
            }
            <span>{{ item().label }}</span>
          </a>
        </li>
      }
    } @else {
      <!-- Nested items -->
      @if (item().children) {
        <li
          hlmSidebarMenuSubItem
          hlmCollapsible
          [expanded]="expanded()"
          (expandedChange)="onExpandedChange($event)"
          [class]="'group/collapsible-' + depth()"
        >
          @if (item().route) {
            <a
              hlmSidebarMenuSubButton
              [routerLink]="item().route"
              routerLinkActive
              #rla="routerLinkActive"
              [isActive]="rla.isActive"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="expand()"
            >
              @if (item().icon) {
                <ng-icon hlm [name]="item().icon!" size="xs" />
              }
              <span>{{ item().label }}</span>
              <ng-icon
                hlm
                name="lucideChevronRight"
                size="xs"
                class="ml-auto transition-transform duration-200"
                [class.rotate-90]="expanded()"
              />
            </a>
          } @else {
            <button hlmSidebarMenuSubButton hlmCollapsibleTrigger>
              @if (item().icon) {
                <ng-icon hlm [name]="item().icon!" size="xs" />
              }
              <span>{{ item().label }}</span>
              <ng-icon
                hlm
                name="lucideChevronRight"
                size="xs"
                class="ml-auto transition-transform duration-200"
                [class.rotate-90]="expanded()"
              />
            </button>
          }
          <ul hlmCollapsibleContent hlmSidebarMenuSub>
            @for (child of item().children; track child.label) {
              <nyct-nav-item
                [item]="child"
                [depth]="depth() + 1"
                [expandedItems]="expandedItems()"
                (expandedItemsChange)="expandedItemsChange.emit($event)"
              />
            }
          </ul>
        </li>
      } @else {
        <li hlmSidebarMenuSubItem>
          <a
            hlmSidebarMenuSubButton
            [routerLink]="item().route"
            routerLinkActive
            #rla="routerLinkActive"
            [isActive]="rla.isActive"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            @if (item().icon) {
              <ng-icon hlm [name]="item().icon!" size="xs" />
            }
            <span>{{ item().label }}</span>
          </a>
        </li>
      }
    }
  `,
})
export class NavItemComponent {
  item = input.required<NavItem>();
  depth = input(0);
  expandedItems = input.required<Set<string>>();
  expandedItemsChange = output<Set<string>>();

  protected isTopLevel = computed(() => this.depth() === 0);

  expanded(): boolean {
    return this.expandedItems().has(this.item().label);
  }

  onExpandedChange(expanded: boolean): void {
    const newSet = new Set(this.expandedItems());
    if (expanded) {
      newSet.add(this.item().label);
    } else {
      newSet.delete(this.item().label);
    }
    this.expandedItemsChange.emit(newSet);
  }

  expand(): void {
    const newSet = new Set(this.expandedItems());
    newSet.add(this.item().label);
    this.expandedItemsChange.emit(newSet);
  }
}
