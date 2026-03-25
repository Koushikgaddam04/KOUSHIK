import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private http = inject(HttpClient);
    private apiBase = '/api';

    calculateQuote(data: any): Observable<any> {
        return this.http.post(`${this.apiBase}/Quote/calculate`, data);
    }

    requestPolicy(data: any): Observable<any> {
        return this.http.post(`${this.apiBase}/Quote/request`, data);
    }

    getMyPolicies(): Observable<any[]> {
        // Note: Assuming backend uses current user's token to deduce policies. 
        return this.http.get<any[]>(`${this.apiBase}/Policy/customer`);
    }

    submitClaim(data: any): Observable<any> {
        return this.http.post(`${this.apiBase}/Claim/submit`, data);
    }

    applyPolicy(userId: number, planName: string, tier: string): Observable<any> {
        return this.http.post(`${this.apiBase}/Policy/request?userId=${userId}&planName=${planName}&tier=${tier}`, {}, { responseType: 'text' as 'json' });
    }

    getActivePlans(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Policy/recent`);
    }

    getPolicyPlans(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Policy/plans`);
    }

    getMyClaims(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Claim/my-claims`);
    }

    getPolicyInvoices(policyId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Document/for/Policy/${policyId}`);
    }

    getMyDependents(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Dependent/my-dependents`);
    }

    addDependent(data: any): Observable<any> {
        return this.http.post(`${this.apiBase}/Dependent`, data);
    }

    deleteDependent(id: number): Observable<any> {
        return this.http.delete(`${this.apiBase}/Dependent/${id}`);
    }

    askChatbot(message: string): Observable<any> {
        return this.http.post(`${this.apiBase}/Chatbot/ask`, { message });
    }
}
