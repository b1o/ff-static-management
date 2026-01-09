import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Optional wrapper component that provides consistent dialog styling.
 * Use this inside your dialog components for standard appearance.
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <nyct-dialog-content title="My Dialog">
 *       <p>Dialog content here</p>
 *       <button (click)="dialogRef.close()">Close</button>
 *     </nyct-dialog-content>
 *   `
 * })
 * export class MyDialogComponent {
 *   dialogRef = inject(DialogRef);
 * }
 * ```
 */
@Component({
  selector: 'nyct-dialog-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface-elevated rounded-xl border border-border p-6 shadow-xl">
      @if (title()) {
        <h2
          [id]="titleId()"
          class="text-lg font-semibold text-text-primary mb-4"
        >
          {{ title() }}
        </h2>
      }
      <ng-content />
    </div>
  `,
  host: {
    '[class]': '"contents"',
  },
})
export class DialogContentComponent {
  /** Optional title displayed at the top of the dialog */
  title = input<string>();

  /** ID for the title element, useful for aria-labelledby */
  titleId = input<string>('dialog-title');
}
