import { Component, computed, input } from '@angular/core';
import { IconComponent, IconName, IconSize } from './icon';
import { cn } from '../../utils/utils';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

const baseStyles =
  'inline-flex items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles: Record<IconButtonVariant, string> = {
  primary: 'bg-primary-500 text-dark-950 hover:bg-primary-400 active:bg-primary-600',
  secondary:
    'bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover active:bg-dark-600',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  danger: 'bg-pastel-rose/20 text-pastel-rose hover:bg-pastel-rose/30 active:bg-pastel-rose/40',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeMap: Record<IconButtonSize, IconSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

@Component({
  selector: 'nyct-icon-button',
  imports: [IconComponent],
  template: `<button
    [type]="type()"
    [disabled]="disabled()"
    [class]="classes()"
    [attr.aria-label]="ariaLabel()"
  >
    <nyct-icon [name]="icon()" [size]="iconSize()" />
  </button>`,
})
export class IconButtonComponent {
  icon = input.required<IconName>();
  variant = input<IconButtonVariant>('ghost');
  size = input<IconButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  ariaLabel = input<string>('');
  class = input<string>('');

  classes = computed(() =>
    cn(baseStyles, variantStyles[this.variant()], sizeStyles[this.size()], this.class())
  );

  iconSize = computed(() => iconSizeMap[this.size()]);
}
