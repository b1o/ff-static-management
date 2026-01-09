import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const { data, error } = await auth.me();
  if (error || !data?.user) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
