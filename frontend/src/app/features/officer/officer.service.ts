import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OfficerService {
    private http = inject(HttpClient);
    private apiBase = '/api';

    getPendingClaims(): Observable<any[]> {
        const officerId = localStorage.getItem('userId') || '0';
        return this.http.get<any[]>(`${this.apiBase}/Staff/claim/pending?officerId=${officerId}`);
    }

    decideClaim(id: string, status: 'Approved' | 'Rejected'): Observable<any> {
        return this.http.patch(`${this.apiBase}/Staff/claim/decide/${id}?status=${status}`, {});
    }

    getAuditLogs(): Observable<any[]> {
        const officerId = localStorage.getItem('userId') || '0';
        return this.http.get<any[]>(`${this.apiBase}/Staff/history/claimofficer?officerId=${officerId}`);
    }
}
