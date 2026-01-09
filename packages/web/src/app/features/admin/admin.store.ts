import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import type { User } from '@ff-static/api/types';
import { AdminService } from './admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth/auth.service';

interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      adminService = inject(AdminService),
      authService = inject(AuthService),
      toastService = inject(ToastService)
    ) => ({
      /** Load all users */
      async loadUsers() {
        patchState(store, { loading: true, error: null });
        const result = await adminService.getUsers();

        if (result.success) {
          patchState(store, { users: result.data, loading: false });
        } else {
          patchState(store, { error: result.error, loading: false });
          toastService.error(result.error);
        }
      },

      /** Impersonate a user */
      async impersonate(userId: string): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        const result = await adminService.impersonate(userId);

        if (result.success) {
          patchState(store, { loading: false });
          toastService.success(`Now impersonating ${result.data.displayName}`);
          // Refresh auth state to pick up impersonation
          await authService.me();
          return true;
        } else {
          patchState(store, { error: result.error, loading: false });
          toastService.error(result.error);
          return false;
        }
      },

      /** Stop impersonating */
      async unimpersonate(): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        const result = await adminService.unimpersonate();

        if (result.success) {
          patchState(store, { loading: false });
          toastService.success(`Restored to ${result.data.displayName}`);
          // Refresh auth state to clear impersonation
          await authService.me();
          return true;
        } else {
          patchState(store, { error: result.error, loading: false });
          toastService.error(result.error);
          return false;
        }
      },

      /** Clear error */
      clearError() {
        patchState(store, { error: null });
      },
    })
  )
);
