import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Utilisation dans les routes :
 * { path: 'pharmacie', canActivate: [roleGuard(['ADMIN','PHARMACIEN'])], ... }
 */
export const roleGuard = (rolesAutorises: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated() && auth.hasRole(...rolesAutorises)) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  };
};
