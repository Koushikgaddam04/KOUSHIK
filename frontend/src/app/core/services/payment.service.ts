import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private http = inject(HttpClient);
    private apiBase = '/api/Payment';

    processPayment(payload: any): Observable<any> {
        return this.http.post(`${this.apiBase}/process`, payload);
    }
}
