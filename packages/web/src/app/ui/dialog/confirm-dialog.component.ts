import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from './dialog-ref';
import { DIALOG_DATA } from './dialog-tokens';
import { ButtonComponent, IconComponent } from '../primitives';

/** Configuration for a confirm dialog */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

/**
 * A confirmation dialog component.
 * Opens via DialogService and returns true if confirmed, false if cancelled.
 *
 * @example
 * ```typescript
 * const confirmed = await this.dialog.open<boolean>(ConfirmDialogComponent, {
 *   data: {
 *     title: 'Delete Item',
 *     message: 'Are you sure?',
 *     variant: 'danger'
 *   }
 * });
 * ```
 */
@Component({
  selector: 'nyct-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="bg-surface-elevated rounded-xl border border-border p-6 shadow-xl">
      <!-- Header -->
      <div class="flex items-start gap-4">
        @if (data.variant === 'danger') {
          <div class="shrink-0 p-2 rounded-full bg-pastel-rose/10">
            <nyct-icon name="warning" size="md" class="text-pastel-rose" />
          </div>
        }
        <div class="flex-1 min-w-0">
          <h2
            id="confirm-dialog-title"
            class="text-lg font-semibold text-text-primary"
          >
            {{ data.title }}
          </h2>
          <p class="mt-2 text-sm text-text-secondary">
            {{ data.message }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-3">
        <nyct-button
          variant="secondary"
          size="sm"
          (click)="cancel()"
        >
          {{ data.cancelText ?? 'Cancel' }}
        </nyct-button>
        <nyct-button
          [variant]="data.variant === 'danger' ? 'danger' : 'primary'"
          size="sm"
          (click)="confirm()"
        >
          {{ data.confirmText ?? 'Confirm' }}
        </nyct-button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);

  protected confirm(): void {
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
