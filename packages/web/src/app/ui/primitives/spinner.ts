import { Component, computed, input } from '@angular/core';
import { cn } from '../../utils/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

const baseStyles = 'animate-spin text-primary-500';

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

@Component({
  selector: 'nyct-spinner',
  template: `<svg
    [class]="classes()"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    ></circle>
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>`,
})
export class SpinnerComponent {
  size = input<SpinnerSize>('md');
  class = input<string>('');

  classes = computed(() => cn(baseStyles, sizeStyles[this.size()], this.class()));
}
