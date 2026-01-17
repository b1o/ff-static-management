import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronRight,
  lucideHome,
  lucideFolder,
  lucideUsers,
  lucideSettings,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan/sidebar';
import { NavItem } from '../nav.types';
import { NavItemComponent } from './nav-item.component';

@Component({
  selector: 'nyct-nav-main',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmSidebarImports, NavItemComponent],
  providers: [
    provideIcons({
      lucideChevronRight,
      lucideHome,
      lucideFolder,
      lucideUsers,
      lucideSettings,
    }),
  ],
  template: `
    <div hlmSidebarGroup>
      <div hlmSidebarGroupContent>
        <div hlmSidebarGroupLabel>Navigation</div>
        <ul hlmSidebarMenu>
          @for (item of items(); track item.label) {
            <nyct-nav-item
              [item]="item"
              [depth]="0"
              [expandedItems]="expandedItems()"
              (expandedItemsChange)="expandedItems.set($event)"
            />
          }
        </ul>
      </div>
    </div>
  `,
})
export class NavMainComponent {
  items = input<NavItem[]>([]);
  protected expandedItems = signal<Set<string>>(new Set());
}
