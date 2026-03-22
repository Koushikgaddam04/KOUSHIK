import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { QuoteEngineComponent } from './quote-engine/quote-engine.component';
import { SubmitClaimComponent } from './submit-claim/submit-claim.component';

export const CUSTOMER_ROUTES: Routes = [
    { path: '', component: CustomerDashboardComponent },
    {
        path: 'policies',
        loadComponent: () => import('./customer-policies/customer-policies.component').then(m => m.CustomerPoliciesComponent)
    },
    { path: 'quote', component: QuoteEngineComponent },
    { path: 'claim', component: SubmitClaimComponent },
    {
        path: 'policy-requests',
        loadComponent: () => import('./customer-policy-requests/customer-policy-requests.component').then(m => m.CustomerPolicyRequestsComponent)
    },
    {
        path: 'claims-tracking',
        loadComponent: () => import('./customer-claims-tracking/customer-claims-tracking.component').then(m => m.CustomerClaimsTrackingComponent)
    },
    {
       path: 'family',
       loadComponent: () => import('./family-management/family-management.component').then(m => m.FamilyManagementComponent)
    }
];
