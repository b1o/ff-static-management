import { Component, computed, input } from '@angular/core';
import { cn } from '../../utils/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-dark-950 hover:bg-primary-400 active:bg-primary-600',
  secondary:
    'bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover active:bg-dark-600',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  danger: 'bg-pastel-rose/20 text-pastel-rose hover:bg-pastel-rose/30 active:bg-pastel-rose/40',
  icon: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary p-0.5!',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

@Component({
  selector: 'nyct-button',
  template: `<button
    [type]="type()"
    [disabled]="disabled()"
    [class]="classes()"
  >
    <ng-content />
  </button>`,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  class = input<string>('');

  classes = computed(() =>
    cn(baseStyles, variantStyles[this.variant()], sizeStyles[this.size()], this.class())
  );
}
