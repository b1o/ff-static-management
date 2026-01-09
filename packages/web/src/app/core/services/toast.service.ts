import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);

  /** Readonly list of active toasts */
  toasts = computed(() => this.toastsSignal());

  /** Show a success toast */
  success(message: string, duration = DEFAULT_DURATION) {
    this.add('success', message, duration);
  }

  /** Show an error toast */
  error(message: string, duration = DEFAULT_DURATION) {
    this.add('error', message, duration);
  }

  /** Show a warning toast */
  warning(message: string, duration = DEFAULT_DURATION) {
    this.add('warning', message, duration);
  }

  /** Show an info toast */
  info(message: string, duration = DEFAULT_DURATION) {
    this.add('info', message, duration);
  }

  /** Dismiss a toast by id */
  dismiss(id: string) {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /** Dismiss all toasts */
  dismissAll() {
    this.toastsSignal.set([]);
  }

  private add(type: ToastType, message: string, duration: number) {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, duration };

    this.toastsSignal.update((toasts) => {
      const updated = [...toasts, toast];
      // Keep only the most recent toasts if we exceed max
      return updated.slice(-MAX_TOASTS);
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
