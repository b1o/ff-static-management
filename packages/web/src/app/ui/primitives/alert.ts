import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils/utils';
import { IconComponent, IconName } from './icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-pastel-sky/10 border-pastel-sky/30 text-pastel-sky',
  success: 'bg-pastel-mint/10 border-pastel-mint/30 text-pastel-mint',
  warning: 'bg-pastel-peach/10 border-pastel-peach/30 text-pastel-peach',
  error: 'bg-pastel-rose/10 border-pastel-rose/30 text-pastel-rose',
};

const variantIcons: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

@Component({
  selector: 'nyct-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div [class]="containerClasses()" role="alert">
      @if (showIcon()) {
        <nyct-icon [name]="icon()" size="sm" class="shrink-0 mt-0.5" />
      }
      <div class="flex-1 min-w-0">
        @if (title()) {
          <p class="font-medium">{{ title() }}</p>
        }
        <p [class]="title() ? 'mt-1 text-sm opacity-90' : ''">
          <ng-content />
        </p>
      </div>
    </div>
  `,
})
export class AlertComponent {
  variant = input<AlertVariant>('info');
  title = input<string>('');
  showIcon = input(true);
  class = input('');

  icon = computed(() => variantIcons[this.variant()]);

  containerClasses = computed(() =>
    cn(
      'flex gap-3 p-4 rounded-lg border text-sm',
      variantStyles[this.variant()],
      this.class()
    )
  );
}
