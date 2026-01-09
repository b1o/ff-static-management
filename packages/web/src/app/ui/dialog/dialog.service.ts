import { Injectable, Injector, Type, inject, signal } from '@angular/core';
import { DialogRef } from './dialog-ref';
import { DIALOG_DATA } from './dialog-tokens';
import { ConfirmDialogComponent, type ConfirmDialogData } from './confirm-dialog.component';

/** Configuration options for opening a dialog */
export interface DialogConfig<D = unknown> {
  /** Data to inject into the dialog component via DIALOG_DATA */
  data?: D;
  /** Whether clicking the backdrop should close the dialog (default: true) */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape should close the dialog (default: true) */
  closeOnEscape?: boolean;
}

/** Internal representation of an active dialog */
export interface ActiveDialog {
  component: Type<unknown>;
  injector: Injector;
  dialogRef: DialogRef<unknown>;
  config: DialogConfig;
}

/**
 * Service for opening dialogs programmatically.
 *
 * @example
 * ```typescript
 * const result = await this.dialog.open(MyDialogComponent, {
 *   data: { title: 'Hello' }
 * });
 *
 * if (result) {
 *   console.log('User submitted:', result);
 * } else {
 *   console.log('User dismissed');
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly injector = inject(Injector);

  /** Signal containing the currently active dialog, or null if none */
  readonly activeDialog = signal<ActiveDialog | null>(null);

  /**
   * Open a dialog component.
   * @param component - The component class to render as a dialog
   * @param config - Optional configuration including data to inject
   * @returns Promise that resolves with the result when the dialog closes
   */
  open<T, D = unknown>(
    component: Type<unknown>,
    config?: DialogConfig<D>
  ): Promise<T | undefined> {
    const dialogRef = new DialogRef<T>();

    const dialogInjector = Injector.create({
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: config?.data ?? null },
      ],
      parent: this.injector,
    });

    this.activeDialog.set({
      component,
      injector: dialogInjector,
      dialogRef: dialogRef as DialogRef<unknown>,
      config: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        ...config,
      },
    });

    // Clean up when dialog closes
    dialogRef.closed$.subscribe(() => {
      this.activeDialog.set(null);
    });

    return dialogRef.toPromise();
  }

  /**
   * Dismiss the currently active dialog without a result.
   * Called by the container on backdrop click or escape key.
   */
  dismissActive(): void {
    const dialog = this.activeDialog();
    if (dialog) {
      dialog.dialogRef.close();
    }
  }

  /**
   * Check if a dialog is currently open.
   */
  isOpen(): boolean {
    return this.activeDialog() !== null;
  }

  /**
   * Convenience method to show a confirmation dialog.
   * @param config - Configuration for the confirm dialog
   * @returns Promise that resolves to true if confirmed, false otherwise
   */
  async confirm(config: ConfirmDialogData): Promise<boolean> {
    const result = await this.open<boolean, ConfirmDialogData>(
      ConfirmDialogComponent,
      { data: config }
    );
    return result ?? false;
  }
}
