import { Routes } from '@angular/router';
import { ClaimsQueueComponent } from './claims-queue/claims-queue.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';

export const OFFICER_ROUTES: Routes = [
    { path: '', component: ClaimsQueueComponent },
    { path: 'logs', component: AuditLogsComponent }
];
