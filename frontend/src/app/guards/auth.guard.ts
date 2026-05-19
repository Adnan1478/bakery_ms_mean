import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (authService.getToken()) {
        return true;
    }

    toast.show('Please login to access this page', 'info');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
