import { Component, computed, input } from '@angular/core';
import { cn } from '../../utils/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

const baseStyles = 'inline-flex items-center font-medium rounded-full';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-text-secondary border border-border',
  success: 'bg-pastel-mint/20 text-pastel-mint',
  warning: 'bg-pastel-peach/20 text-pastel-peach',
  error: 'bg-pastel-rose/20 text-pastel-rose',
  info: 'bg-pastel-sky/20 text-pastel-sky',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

@Component({
  selector: 'nyct-badge',
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');
  size = input<BadgeSize>('sm');
  class = input<string>('');

  classes = computed(() =>
    cn(baseStyles, variantStyles[this.variant()], sizeStyles[this.size()], this.class())
  );
}
