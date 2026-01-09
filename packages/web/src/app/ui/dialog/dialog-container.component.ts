import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DialogService } from './dialog.service';

/**
 * Global container component that renders active dialogs.
 * Place this once in your app root template.
 *
 * @example
 * ```html
 * <!-- app.html -->
 * <router-outlet />
 * <nyct-dialog-container />
 * ```
 */
@Component({
  selector: 'nyct-dialog-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  template: `
    @if (dialogService.activeDialog(); as dialog) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-dark-950/80 animate-in fade-in duration-150"
          (click)="onBackdropClick()"
        ></div>

        <!-- Dialog content -->
        <div class="relative z-10 w-full max-w-md mx-4 animate-in zoom-in-95 duration-150">
          <ng-container
            *ngComponentOutlet="dialog.component; injector: dialog.injector"
          />
        </div>
      </div>
    }
  `,
  host: {
    '[class]': '"contents"',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class DialogContainerComponent {
  protected readonly dialogService = inject(DialogService);

  protected onBackdropClick(): void {
    const dialog = this.dialogService.activeDialog();
    if (dialog?.config.closeOnBackdrop !== false) {
      this.dialogService.dismissActive();
    }
  }

  protected onEscape(): void {
    const dialog = this.dialogService.activeDialog();
    if (dialog?.config.closeOnEscape !== false) {
      this.dialogService.dismissActive();
    }
  }
}
