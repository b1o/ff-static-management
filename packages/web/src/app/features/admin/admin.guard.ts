import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // First ensure user is authenticated
  const { data, error } = await auth.me();
  if (error || !data?.user) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Then check if user is admin
  if (!auth.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
