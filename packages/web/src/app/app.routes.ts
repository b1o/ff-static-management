import { Routes } from '@angular/router';
import { LayoutComponent } from './ui';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './features/admin/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'statics',
        loadChildren: () =>
          import('./features/statics/statics.routes').then((m) => m.STATICS_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routes'),
      },
    ],
  },
];
