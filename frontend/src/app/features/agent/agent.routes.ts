import { Routes } from '@angular/router';
import { VerificationQueueComponent } from './verification-queue/verification-queue.component';
import { AgentHistoryComponent } from './agent-history/agent-history.component';

export const AGENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent)
    },
    { path: 'queue', component: VerificationQueueComponent },
    { path: 'history', component: AgentHistoryComponent }
];
