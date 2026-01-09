import { Routes } from '@angular/router';

export const STATICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pages/statics/statics-list.page').then((m) => m.StaticsListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../../pages/statics/statics-create.page').then((m) => m.StaticsCreatePage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../../pages/statics/statics-detail.page').then((m) => m.StaticsDetailPage),
  },
];
