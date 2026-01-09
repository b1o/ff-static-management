import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'nyct-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastComponent],
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <nyct-toast
          [type]="toast.type"
          [message]="toast.message"
          (dismiss)="toastService.dismiss(toast.id)"
          class="pointer-events-auto"
        />
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);
}
