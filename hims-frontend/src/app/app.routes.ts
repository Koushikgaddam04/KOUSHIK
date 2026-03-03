import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [roleGuard],
        children: [
            {
                path: 'admin',
                canActivate: [roleGuard],
                data: { role: 'Admin' },
                loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
            },
            {
                path: 'customer',
                canActivate: [roleGuard],
                data: { role: 'Customer' },
                loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
            },
            {
                path: 'agent',
                canActivate: [roleGuard],
                data: { role: 'Agent' },
                loadChildren: () => import('./features/agent/agent.routes').then(m => m.AGENT_ROUTES)
            },
            {
                path: 'officer',
                canActivate: [roleGuard],
                data: { role: 'ClaimsOfficer' }, // Based on backend expected role string
                loadChildren: () => import('./features/officer/officer.routes').then(m => m.OFFICER_ROUTES)
            }
        ]
    },
    { path: '**', redirectTo: '/login' }
];
