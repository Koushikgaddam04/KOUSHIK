import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private http = inject(HttpClient);
    private apiBase = '/api/Document';

    // Upload a document linked to a specific entity (Policy or Claim)
    uploadForEntity(file: File, docType: string, entityType: string, entityId: number): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId.toString());
        return this.http.post(`${this.apiBase}/upload`, formData);
    }

    // Legacy: upload without entity linkage (kept for compatibility)
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

    // Get all documents linked to a specific entity (e.g. Policy or Claim)
    getForEntity(entityType: string, entityId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/for/${entityType}/${entityId}`);
    }

    getViewUrl(id: number): string {
        return `${this.apiBase}/view/${id}`;
    }

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiBase}/download/${id}`, { responseType: 'blob' });
    }

    saveFile(blob: Blob, fileName: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    reviewDocument(id: number, status: string, comments: string): Observable<any> {
        return this.http.patch(`${this.apiBase}/review/${id}`, { status, comments });
    }

    getPendingDocuments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/pending`);
    }
}
