import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-users.page').then((m) => m.AdminUsersPage),
  },
] satisfies Routes;
