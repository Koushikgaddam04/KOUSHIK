import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, LogIn, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Authenticating..."></app-loading-spinner>

    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center text-blue-600 mb-6">
          <lucide-icon name="shield-check" class="h-16 w-16"></lucide-icon>
        </div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          Or
          <a
            routerLink="/register"
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            create a new customer profile
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          class="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden"
        >
          <!-- Decorative Background element -->
          <div
            class="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"
          ></div>

          <form class="space-y-6 relative z-10" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="mail" class="h-5 w-5 text-slate-400"></lucide-icon>
                </div>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 transition-colors outline-none border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="lock" class="h-5 w-5 text-slate-400"></lucide-icon>
                </div>
                <input
                  id="password"
                  formControlName="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 transition-colors outline-none border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label for="remember-me" class="ml-2 block text-sm text-slate-900 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div class="text-sm">
                <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="isLoading()"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed items-center gap-2"
              >
                <lucide-icon name="log-in" class="h-5 w-5"></lucide-icon>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.warning(
        'Please enter a valid email and password (minimum 6 characters).',
        'Invalid Form',
      );
      return;
    }

    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toastr.success('Welcome back!', 'Login Successful');

          // Role matching handling case sensitivity safely
          const role = res.UserRole || res.userRole;

          switch (role?.toLowerCase()) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'customer':
              this.router.navigate(['/customer']);
              break;
            case 'agent':
              this.router.navigate(['/agent']);
              break;
            case 'claimsofficer':
              this.router.navigate(['/officer']);
              break;
            default:
              console.warn('Unknown role:', role);
              this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastr.error('Invalid credentials or account issue.', 'Login Failed');
          console.error('Login error', err);
        },
      });
    }
  }
}
