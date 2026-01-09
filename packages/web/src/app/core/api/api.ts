import { InjectionToken, isDevMode } from '@angular/core';
import { treaty } from '@elysiajs/eden';
import { App } from '@ff-static/api';
import type { User } from '@ff-static/api/types';

export const API_URL = isDevMode()
  ? 'http://localhost:3000'
  : 'https://ff-static-management.fly.dev/';

export const API = new InjectionToken('API', {
  providedIn: 'root',
  factory: () =>
    treaty<App>(API_URL, {
      onRequest: (_path, options) => {
        options.credentials = 'include';
      },
    }),
});

export type Api = ReturnType<typeof treaty<App>>;
export type MeResposne = Awaited<ReturnType<Api['auth']['me']['get']>>;
export type { User };
