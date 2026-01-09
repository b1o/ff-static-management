import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { cn } from '../../utils/utils';
import { IconComponent, IconName } from '../primitives/icon';
import { ToastType } from '../../core/services/toast.service';

const typeStyles: Record<ToastType, string> = {
  success: 'bg-pastel-mint/10 border-pastel-mint/30 text-pastel-mint',
  error: 'bg-pastel-rose/10 border-pastel-rose/30 text-pastel-rose',
  warning: 'bg-pastel-peach/10 border-pastel-peach/30 text-pastel-peach',
  info: 'bg-pastel-sky/10 border-pastel-sky/30 text-pastel-sky',
};

const typeIcons: Record<ToastType, IconName> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

@Component({
  selector: 'nyct-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div
      [class]="containerClasses()"
      role="alert"
      aria-live="polite"
    >
      <nyct-icon [name]="icon()" size="sm" class="shrink-0" />
      <span class="flex-1 text-sm">{{ message() }}</span>
      <button
        type="button"
        (click)="dismiss.emit()"
        class="shrink-0 p-1 -m-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <nyct-icon name="x" size="sm" />
      </button>
    </div>
  `,
})
export class ToastComponent {
  type = input<ToastType>('info');
  message = input.required<string>();
  dismiss = output<void>();

  icon = computed(() => typeIcons[this.type()]);

  containerClasses = computed(() =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
      'animate-in slide-in-from-right duration-200',
      typeStyles[this.type()]
    )
  );
}
