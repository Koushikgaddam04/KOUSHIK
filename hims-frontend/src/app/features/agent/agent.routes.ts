import { Routes } from '@angular/router';
import { VerificationQueueComponent } from './verification-queue/verification-queue.component';
import { AgentHistoryComponent } from './agent-history/agent-history.component';

export const AGENT_ROUTES: Routes = [
    { path: '', component: VerificationQueueComponent },
    { path: 'history', component: AgentHistoryComponent }
];
