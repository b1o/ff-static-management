import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SpinnerComponent } from '../primitives/spinner';

@Component({
  selector: 'nyct-loading-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  template: `
    @if (loading()) {
      <div
        class="absolute inset-0 z-10 flex items-center justify-center bg-surface/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div class="flex flex-col items-center gap-3">
          <nyct-spinner size="lg" />
          @if (message()) {
            <span class="text-sm text-text-secondary">{{ message() }}</span>
          }
        </div>
      </div>
    }
  `,
  host: {
    '[class]': '"contents"',
  },
})
export class LoadingOverlayComponent {
  loading = input(false);
  message = input<string>('');
}
