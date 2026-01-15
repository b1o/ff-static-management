import { Component, computed, input, output } from '@angular/core';
import { cn } from '../../utils/utils';
import { IconComponent, IconName } from './icon';

export type ListSize = 'sm' | 'md';
export type ListItemVariant = 'default' | 'interactive';

// ─────────────────────────────────────────────────────────────────────────────
// List Container
// ─────────────────────────────────────────────────────────────────────────────

const listBaseStyles = 'flex flex-col';

const listSizeStyles: Record<ListSize, string> = {
  sm: 'gap-0.5',
  md: 'gap-1',
};

@Component({
  selector: 'nyct-list',
  template: `<div role="list" [class]="classes()"><ng-content /></div>`,
})
export class ListComponent {
  size = input<ListSize>('md');
  class = input<string>('');

  classes = computed(() =>
    cn(listBaseStyles, listSizeStyles[this.size()], this.class())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List Item
// ─────────────────────────────────────────────────────────────────────────────

const itemBaseStyles =
  'flex items-center rounded-lg transition-colors duration-150';

const itemVariantStyles: Record<ListItemVariant, string> = {
  default: '',
  interactive:
    'cursor-pointer hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
};

const itemSizeStyles: Record<ListSize, string> = {
  sm: 'px-2 py-1.5 gap-2',
  md: 'px-3 py-2 gap-3',
};

@Component({
  selector: 'nyct-list-item',
  template: `<div
    role="listitem"
    [tabindex]="variant() === 'interactive' ? 0 : -1"
    [class]="classes()"
  >
    <ng-content />
  </div>`,
  host: {
    '(keydown.enter)': 'handleKeydown($event)',
    '(keydown.space)': 'handleKeydown($event)',
  },
})
export class ListItemComponent {
  variant = input<ListItemVariant>('default');
  size = input<ListSize>('md');
  class = input<string>('');

  classes = computed(() =>
    cn(
      itemBaseStyles,
      itemVariantStyles[this.variant()],
      itemSizeStyles[this.size()],
      this.class()
    )
  );

  handleKeydown(event: Event): void {
    if (this.variant() === 'interactive') {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// List Item Leading (icon/avatar slot)
// ─────────────────────────────────────────────────────────────────────────────

const leadingSizeStyles: Record<ListSize, string> = {
  sm: 'w-5 h-5 text-sm',
  md: 'w-6 h-6 text-base',
};

@Component({
  selector: 'nyct-list-item-leading',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class ListItemLeadingComponent {
  size = input<ListSize>('md');
  class = input<string>('');

  classes = computed(() =>
    cn(
      'flex-shrink-0 flex items-center justify-center text-text-muted',
      leadingSizeStyles[this.size()],
      this.class()
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List Item Content (text area)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'nyct-list-item-content',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class ListItemContentComponent {
  class = input<string>('');

  classes = computed(() =>
    cn('flex-1 min-w-0 flex flex-col justify-center', this.class())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List Item Title
// ─────────────────────────────────────────────────────────────────────────────

const titleSizeStyles: Record<ListSize, string> = {
  sm: 'text-sm',
  md: 'text-sm',
};

@Component({
  selector: 'nyct-list-item-title',
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class ListItemTitleComponent {
  size = input<ListSize>('md');
  class = input<string>('');

  classes = computed(() =>
    cn(
      'text-text-primary font-medium truncate',
      titleSizeStyles[this.size()],
      this.class()
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List Item Description
// ─────────────────────────────────────────────────────────────────────────────

const descSizeStyles: Record<ListSize, string> = {
  sm: 'text-xs',
  md: 'text-xs',
};

@Component({
  selector: 'nyct-list-item-desc',
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class ListItemDescComponent {
  size = input<ListSize>('md');
  class = input<string>('');

  classes = computed(() =>
    cn('text-text-muted truncate', descSizeStyles[this.size()], this.class())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List Item Trailing (action/meta slot)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'nyct-list-item-trailing',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class ListItemTrailingComponent {
  class = input<string>('');

  classes = computed(() =>
    cn('flex-shrink-0 flex items-center text-text-muted', this.class())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List Divider
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'nyct-list-divider',
  template: `<div [class]="classes()" role="separator"></div>`,
})
export class ListDividerComponent {
  inset = input<boolean>(false);
  class = input<string>('');

  classes = computed(() =>
    cn('h-px bg-border my-1', this.inset() ? 'ml-11' : '', this.class())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple List Item (shorthand composing existing components)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'nyct-list-item-simple',
  imports: [
    IconComponent,
    ListItemComponent,
    ListItemLeadingComponent,
    ListItemContentComponent,
    ListItemTitleComponent,
    ListItemDescComponent,
    ListItemTrailingComponent,
  ],
  template: `
    <nyct-list-item
      [variant]="interactive() ? 'interactive' : 'default'"
      [size]="size()"
      [class]="class()"
      (click)="interactive() && selected.emit()"
    >
      @if (icon()) {
        <nyct-list-item-leading [size]="size()">
          <nyct-icon [name]="icon()!" />
        </nyct-list-item-leading>
      }
      <nyct-list-item-content>
        <nyct-list-item-title [size]="size()">{{ title() }}</nyct-list-item-title>
        @if (desc()) {
          <nyct-list-item-desc [size]="size()">{{ desc() }}</nyct-list-item-desc>
        }
      </nyct-list-item-content>
      @if (showChevron()) {
        <nyct-list-item-trailing>
          <nyct-icon name="chevron-right" size="xs" />
        </nyct-list-item-trailing>
      }
    </nyct-list-item>
  `,
})
export class ListItemSimpleComponent {
  title = input.required<string>();
  desc = input<string>();
  icon = input<IconName>();
  size = input<ListSize>('md');
  interactive = input<boolean>(true);
  showChevron = input<boolean>(false);
  class = input<string>('');

  selected = output<void>();
}
