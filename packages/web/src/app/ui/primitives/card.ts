import { Component, computed, input } from '@angular/core';
import { cn } from '../../utils/utils';

export type CardVariant = 'default' | 'elevated';

const baseStyles = 'rounded-xl border';

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface border-border',
  elevated: 'bg-surface-elevated border-border-subtle shadow-lg shadow-black/20',
};

@Component({
  selector: 'nyct-card',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardComponent {
  variant = input<CardVariant>('default');
  class = input<string>('');

  classes = computed(() => cn(baseStyles, variantStyles[this.variant()], this.class()));
}

@Component({
  selector: 'nyct-card-header',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardHeaderComponent {
  class = input<string>('');
  classes = computed(() => cn('px-6 py-4 border-b border-border grow', this.class()));
}

@Component({
  selector: 'nyct-card-content',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardContentComponent {
  class = input<string>('');
  classes = computed(() => cn('px-6 py-4', this.class()));
}

@Component({
  selector: 'nyct-card-footer',
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardFooterComponent {
  class = input<string>('');
  classes = computed(() => cn('px-6 py-4 border-t border-border', this.class()));
}
