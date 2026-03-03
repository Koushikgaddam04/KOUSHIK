import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { QuoteEngineComponent } from './quote-engine/quote-engine.component';
import { SubmitClaimComponent } from './submit-claim/submit-claim.component';

export const CUSTOMER_ROUTES: Routes = [
    { path: '', component: CustomerDashboardComponent },
    { path: 'quote', component: QuoteEngineComponent },
    { path: 'claim', component: SubmitClaimComponent }
];
