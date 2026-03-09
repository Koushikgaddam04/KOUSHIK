import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private http = inject(HttpClient);
    private apiBase = '/api/Document';

    upload(file: File, docType: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);
        return this.http.post(`${this.apiBase}/upload`, formData);
    }

    getMyDocuments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/my-documents`);
    }

    getUserDocuments(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/user/${userId}`);
    }

    getDownloadUrl(fileName: string): string {
        return `${this.apiBase}/download/${fileName}`;
    }

    getViewUrl(fileName: string): string {
        return `${this.apiBase}/view/${fileName}`;
    }

    reviewDocument(id: number, status: string, comments: string): Observable<any> {
        return this.http.patch(`${this.apiBase}/review/${id}`, { status, comments });
    }

    getPendingDocuments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/pending`);
    }
}
