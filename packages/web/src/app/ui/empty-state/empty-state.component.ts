import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent, IconName } from '../primitives/icon';

@Component({
  selector: 'nyct-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
      @if (icon()) {
        <div class="mb-4 p-4 rounded-full bg-surface-elevated">
          <nyct-icon [name]="icon()!" size="xl" class="text-text-muted" />
        </div>
      }
      <h3 class="text-lg font-medium text-text-primary">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-2 text-sm text-text-secondary max-w-sm">
          {{ description() }}
        </p>
      }
      <div class="mt-6">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<IconName | null>(null);
  title = input.required<string>();
  description = input<string>('');
}
