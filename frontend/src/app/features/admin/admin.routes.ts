import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AddStaffComponent } from './add-staff/add-staff.component';
import { ManagePoliciesComponent } from './manage-policies/manage-policies.component';
import { DocumentVerificationComponent } from './document-verification/document-verification.component';

export const ADMIN_ROUTES: Routes = [
    { path: '', component: AdminDashboardComponent },
    { path: 'add-staff', component: AddStaffComponent },
    { path: 'policies', component: ManagePoliciesComponent },
    { path: 'verify-docs', component: DocumentVerificationComponent }
];
