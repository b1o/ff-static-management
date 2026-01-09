import { Subject, firstValueFrom } from 'rxjs';

/**
 * Reference to an open dialog.
 * Used by dialog components to close themselves with an optional result.
 */
export class DialogRef<T = unknown> {
  private readonly closedSubject = new Subject<T | undefined>();

  /** Observable that emits when the dialog is closed */
  readonly closed$ = this.closedSubject.asObservable();

  /**
   * Close the dialog with an optional result.
   * @param result - The result to return to the opener. Undefined means dismissed.
   */
  close(result?: T): void {
    this.closedSubject.next(result);
    this.closedSubject.complete();
  }

  /**
   * Convert the closed observable to a promise.
   * Resolves when the dialog closes.
   */
  toPromise(): Promise<T | undefined> {
    return firstValueFrom(this.closed$);
  }
}
