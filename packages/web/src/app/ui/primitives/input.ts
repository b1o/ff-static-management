import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
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

let inputIdCounter = 0;

@Component({
  selector: 'nyct-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    @if (!hidden()) {
      @if (label()) {
        <label [for]="inputId" class="block mb-1.5 text-sm font-medium text-text-primary">
          {{ label() }}
          @if (required()) {
            <span class="text-pastel-rose" aria-hidden="true">*</span>
          }
        </label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [attr.required]="required() || null"
        [attr.minlength]="minLength()"
        [attr.maxlength]="maxLength()"
        [attr.aria-label]="!label() ? ariaLabel() : null"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-describedby]="invalid() && errors().length > 0 ? errorId : null"
        [class]="classes()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="touched.set(true)"
      />
      @if (invalid() && errors().length > 0 && touched()) {
        <div [id]="errorId" class="mt-1 text-sm text-pastel-rose" role="alert">
          @for (error of errors(); track error.message) {
            <span>{{ error.message }}</span>
          }
        </div>
      }
    }
  `,
})
export class InputComponent implements FormValueControl<string> {
  // Component-specific inputs
  type = input<'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'>('text');
  placeholder = input<string>('');
  variant = input<InputVariant>('default');
  size = input<InputSize>('md');
  class = input<string>('');
  label = input<string>('');
  ariaLabel = input<string>('');

  // Generated IDs for accessibility
  protected readonly inputId = `nyct-input-${inputIdCounter++}`;
  protected readonly errorId = `${this.inputId}-errors`;

  // FormValueControl: required value signal
  value = model<string>('');

  // FormValueControl: writable interaction state
  touched = model<boolean>(false);

  // FormValueControl: read-only state from form system
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly ValidationError.WithOptionalField[]>([]);

  // FormValueControl: validation constraints
  required = input<boolean>(false);
  minLength = input<number | undefined>(undefined);
  maxLength = input<number | undefined>(undefined);

  protected classes = computed(() => {
    const effectiveVariant = this.invalid() ? 'error' : this.variant();
    return cn(baseStyles, variantStyles[effectiveVariant], sizeStyles[this.size()], this.class());
  });

  protected onInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value.set(inputValue);
  }
}
