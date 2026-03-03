import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, User, Mail, Lock, UserPlus, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Creating profile..."></app-loading-spinner>

    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 transition-colors duration-200">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center text-blue-600 mb-6 relative">
          <div class="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 blur-xl opacity-50 rounded-full scale-150"></div>
          <lucide-icon name="user-plus" class="h-16 w-16 relative z-10 text-blue-600 dark:text-blue-500"></lucide-icon>
        </div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Create Customer Profile
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?
          <a
            routerLink="/login"
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in here
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          class="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-200"
        >
          <!-- Decorative Background element -->
          <div
            class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"
          ></div>

          <form class="space-y-6 relative z-10" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div>
              <label for="fullName" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="user" class="h-5 w-5 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  id="fullName"
                  formControlName="fullName"
                  type="text"
                  autocomplete="name"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg py-3 transition-colors outline-none border"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="mail" class="h-5 w-5 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg py-3 transition-colors outline-none border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="lock" class="h-5 w-5 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  id="password"
                  formControlName="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg py-3 transition-colors outline-none border"
                  placeholder="••••••••"
                />
              </div>
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="mt-2 text-xs text-slate-500">
                  Password must be at least 6 characters long.
                </p>
              }
            </div>

            <div>
              <button
                type="submit"
                [disabled]="isLoading()"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed items-center gap-2 mt-4"
              >
                <lucide-icon name="user-plus" class="h-5 w-5"></lucide-icon>
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isLoading = signal(false);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Customer'], // defaulting registration to Customer
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toastr.warning(
        'Please complete all fields. Password must be at least 6 characters.',
        'Invalid Form',
      );
      // Mark all fields as touched to trigger validation messages
      Object.values(this.registerForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    if (this.registerForm.valid) {
      this.isLoading.set(true);
      const { role, ...rest } = this.registerForm.value;
      const payload = { ...rest, roleId: 3 }; // 3 is Customer in backend enum

      this.authService.register(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastr.success('Registration successful. Please login.', 'Welcome to HIMS');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          let errorMsg = 'Registration failed. Email might be in use.';
          if (typeof err.error === 'string') {
            errorMsg = err.error || errorMsg;
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          this.toastr.error(errorMsg, 'Error');
          console.error('Registration error', err);
        },
      });
    }
  }
}
