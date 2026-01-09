import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import type { Static,  InviteCode } from '@ff-static/api/types';
import { StaticsService, StaticWithMembers } from './statics.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth/auth.service';

interface StaticsState {
  statics: (Static & {inviteLinks?: InviteCode[]})[];
  selectedStatic: StaticWithMembers | null;
  loading: boolean;
  error: string | null;
}

const initialState: StaticsState = {
  statics: [],
  selectedStatic: null,
  loading: false,
  error: null,
};

export const StaticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store, authService = inject(AuthService)) => ({
    hasStatics: computed(() => store.statics().length > 0),

    /** Check if current user is a leader of the selected static */
    isLeader: computed(() => {
      const user = authService.user();
      const staticData = store.selectedStatic();
      if (!user || !staticData) return false;
      const member = staticData.members.find((m) => m.userId === user.id);
      return member?.role === 'leader';
    }),

    /** Check if current user can manage the selected static */
    canManage: computed(() => {
      const user = authService.user();
      const staticData = store.selectedStatic();
      if (!user || !staticData) return false;
      const member = staticData.members.find((m) => m.userId === user.id);
      return member?.role === 'leader' || member?.canManage === true;
    }),

    /** Get current user's membership in the selected static */
    currentMembership: computed(() => {
      const user = authService.user();
      const staticData = store.selectedStatic();
      if (!user || !staticData) return null;
      return staticData.members.find((m) => m.userId === user.id) ?? null;
    }),
  })),
  withMethods(
    (
      store,
      staticsService = inject(StaticsService),
      toastService = inject(ToastService)
    ) => ({
      /** Load all statics for the current user */
      async loadMyStatics() {
        patchState(store, { loading: true, error: null });
        const result = await staticsService.getMyStatics();

        if (result.success) {
          patchState(store, { statics: result.data, loading: false });
        } else {
          patchState(store, { error: result.error, loading: false });
        }
      },

      /** Load a single static by ID */
      async loadStatic(id: string) {
        patchState(store, { loading: true, error: null, selectedStatic: null });
        const result = await staticsService.getStatic(id);

        if (result.success) {
          patchState(store, { selectedStatic: result.data, loading: false });
        } else {
          patchState(store, { error: result.error, loading: false });
        }
      },

      /** Create a new static */
      async createStatic(name: string): Promise<StaticWithMembers | null> {
        patchState(store, { loading: true, error: null });
        const result = await staticsService.createStatic(name);

        if (result.success) {
          patchState(store, {
            statics: [...store.statics(), result.data],
            loading: false,
          });
          toastService.success(`Static "${name}" created successfully`);
          return result.data;
        } else {
          patchState(store, { error: result.error, loading: false });
          return null;
        }
      },

      /** Delete a static */
      async deleteStatic(id: string): Promise<boolean> {
        patchState(store, { loading: true, error: null });
        const result = await staticsService.deleteStatic(id);

        if (result.success) {
          patchState(store, {
            statics: store.statics().filter((s) => s.id !== id),
            selectedStatic:
              store.selectedStatic()?.id === id ? null : store.selectedStatic(),
            loading: false,
          });
          toastService.success('Static deleted successfully');
          return true;
        } else {
          patchState(store, { error: result.error, loading: false });
          return false;
        }
      },

      /** Remove a member from the selected static */
      async removeMember(userId: string): Promise<boolean> {
        const staticData = store.selectedStatic();
        if (!staticData) return false;

        patchState(store, { loading: true, error: null });
        const result = await staticsService.removeMember(staticData.id, userId);

        if (result.success) {
          // Optimistically update - we can remove locally since we have all data
          patchState(store, {
            selectedStatic: {
              ...staticData,
              members: staticData.members.filter((m) => m.userId !== userId),
            },
            loading: false,
          });
          toastService.success('Member removed successfully');
          return true;
        } else {
          patchState(store, { error: result.error, loading: false });
          return false;
        }
      },

      /** Update member permissions */
      async updateMemberPermissions(
        userId: string,
        canManage: boolean
      ): Promise<boolean> {
        const staticData = store.selectedStatic();
        if (!staticData) return false;

        patchState(store, { loading: true, error: null });
        const result = await staticsService.updateMemberPermissions(
          staticData.id,
          userId,
          canManage
        );

        if (result.success) {
          // Optimistically update the canManage flag locally
          patchState(store, {
            selectedStatic: {
              ...staticData,
              members: staticData.members.map((m) =>
                m.userId === userId ? { ...m, canManage } : m
              ),
            },
            loading: false,
          });
          toastService.success('Permissions updated successfully');
          return true;
        } else {
          patchState(store, { error: result.error, loading: false });
          return false;
        }
      },

      async generateInviteLink(
        expiresAt: Date | null = null,
        maxUses: number | null = null
      ): Promise<{ inviteCode: string; inviteLink: string } | null> {
        const staticData = store.selectedStatic();
        if (!staticData) return null;
        patchState(store, { loading: true, error: null });
        const result = await staticsService.generateInviteLink(
          staticData.id,
          expiresAt,
          maxUses
        );
        if (result.success) {
          patchState(store, { loading: false });
          const code = result.data.inviteCode.code;
          const inviteLink = `${window.location.origin}/invite/${code}`;
          toastService.success('Invite link generated successfully');
          return { inviteCode: code, inviteLink };
        }
        patchState(store, { error: result.error, loading: false });
        return null;
      },

      /** Clear the current error */
      clearError() {
        patchState(store, { error: null });
      },

      /** Clear the selected static */
      clearSelectedStatic() {
        patchState(store, { selectedStatic: null });
      },
    })
  )
);
