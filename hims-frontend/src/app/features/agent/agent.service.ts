import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AgentService {
    private http = inject(HttpClient);
    private apiBase = '/api';

    getVerificationQueue(): Observable<any[]> {
        // Retrieve current user ID from localStorage (set during login)
        const agentId = localStorage.getItem('userId') || '0';

        return this.http.get<any[]>(`${this.apiBase}/Staff/policy/pending?agentId=${agentId}`);
    }

    verifyPolicy(id: string): Observable<any> {
        return this.http.patch(`${this.apiBase}/Staff/policy/verify/${id}?status=Active`, {}, { responseType: 'text' });
    }

    getHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/Staff/history/agent`);
    }


}
