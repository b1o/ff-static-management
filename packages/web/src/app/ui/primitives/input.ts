import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { cn } from '../../utils/utils';

export type InputVariant = 'default' | 'error';
export type InputSize = 'sm' | 'md' | 'lg';

const baseStyles =
  'w-full rounded-lg bg-surface-elevated border text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles: Record<InputVariant, string> = {
  default: 'border-border hover:border-dark-500 focus:border-primary-500',
  error: 'border-pastel-rose hover:border-pastel-rose focus:ring-pastel-rose',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
};

@Component({
  selector: 'nyct-input',
  imports: [FormsModule],
  template: `<input
    [type]="type()"
    [placeholder]="placeholder()"
    [disabled]="disabled()"
    [class]="classes()"
    [(ngModel)]="value"
  />`,
})
export class InputComponent {
  type = input<'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'>('text');
  placeholder = input<string>('');
  variant = input<InputVariant>('default');
  size = input<InputSize>('md');
  disabled = input<boolean>(false);
  class = input<string>('');
  value = model<string>('');

  classes = computed(() =>
    cn(baseStyles, variantStyles[this.variant()], sizeStyles[this.size()], this.class())
  );
}
