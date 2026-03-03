import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface User {
    email: string;
    role: string;
}

export interface LoginResponse {
    token?: string;
    Token?: string;
    userEmail?: string;
    UserEmail?: string;
    userRole?: string;
    UserRole?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = '/api/Auth'; // Update port if necessary depending on backend

    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    constructor() {
        this.checkInitialAuth();
    }

    private checkInitialAuth() {
        const token = localStorage.getItem('jwt');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');

        if (token && email && role) {
            this.currentUser.set({ email, role });
            this.isAuthenticated.set(true);
        }
    }

    login(credentials: any): Observable<any> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((res) => {
                const token = res.Token || res.token;
                const email = res.UserEmail || res.userEmail;
                const role = res.UserRole || res.userRole;

                if (token && email && role) {
                    localStorage.setItem('jwt', token);
                    localStorage.setItem('email', email);
                    localStorage.setItem('role', role);

                    this.currentUser.set({ email: email, role: role });
                    this.isAuthenticated.set(true);
                } else {
                    console.error('Login response missing required fields:', res);
                    throw new Error('Invalid login response format');
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        // Some ASP.NET endpoints return a plain string or 200 OK with empty body.
        // Handling as 'text' avoids HttpErrorResponse JSON parsing errors.
        return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
    }

    logout() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/']);
    }

    getToken(): string | null {
        return localStorage.getItem('jwt');
    }

    hasRole(role: string): boolean {
        const user = this.currentUser();
        return user ? user.role === role : false;
    }
}
