import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.parseUrl('/login');
    }

    const expectedRole = route.data['role'];
    if (expectedRole && !authService.hasRole(expectedRole)) {
        // Determine where to redirect based on actual role
        const currentRole = authService.currentUser()?.role;
        switch (currentRole?.toLowerCase()) {
            case 'admin': return router.parseUrl('/admin');
            case 'agent': return router.parseUrl('/agent');
            case 'claimsofficer': return router.parseUrl('/officer');
            case 'customer': return router.parseUrl('/customer');
            default: return router.parseUrl('/login');
        }
    }

    return true;
};
