import { InjectionToken } from '@angular/core';

/**
 * Injection token for dialog data.
 * Use this to inject data passed to a dialog component.
 *
 * @example
 * ```typescript
 * interface MyDialogData {
 *   title: string;
 *   id: number;
 * }
 *
 * @Component({...})
 * export class MyDialogComponent {
 *   private data = inject<MyDialogData>(DIALOG_DATA);
 * }
 * ```
 */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');
