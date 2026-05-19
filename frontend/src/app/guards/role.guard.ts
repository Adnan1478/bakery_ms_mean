import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const user = authService.currentUserValue;
    const expectedRoles = route.data['roles'] as Array<string>;

    if (!user || !user.token) {
        router.navigate(['/login']);
        return false;
    }

    if (expectedRoles && expectedRoles.includes(user.role)) {
        return true;
    }

    toast.show('Access Denied: You do not have permission', 'error');
    router.navigate(['/']);
    return false;
};
