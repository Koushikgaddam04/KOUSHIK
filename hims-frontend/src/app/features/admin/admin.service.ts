import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminSummary {
    totalRevenue: number;
    totalActivePolicies: number;
    pendingClaimsCount: number;
    totalPayouts: number;
    unpaidCommissions: number;
    documentsToVerify: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiBase = '/api';

    getSummary(): Observable<AdminSummary> {
        return this.http.get<AdminSummary>(`${this.apiBase}/Dashboard/admin-summary`);
    }

    addStaff(staffData: any): Observable<any> {
        return this.http.post(`${this.apiBase}/Auth/admin/add-staff`, staffData, { responseType: 'text' as 'json' });
    }

    getRecentPolicies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Policy/recent`);
    }

    deletePolicy(id: string): Observable<any> {
        return this.http.delete(`${this.apiBase}/Policy/${id}`);
    }

    assignPolicy(policyId: string, agentId: string): Observable<any> {
        return this.http.patch(`${this.apiBase}/Policy/assign-agent?policyId=${policyId}&agentId=${agentId}`, {}, { responseType: 'text' as 'json' });
    }

    createPolicy(policyData: any): Observable<any> {
        return this.http.post(`${this.apiBase}/Policy/create`, policyData);
    }

    getAgents(): Observable<any[]> {
        // Assuming a way to get staff to populate the assignment dropdown
        return this.http.get<any[]>(`${this.apiBase}/Staff/agents`);
    }
}
