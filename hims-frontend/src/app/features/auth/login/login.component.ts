import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, LogIn, Lock, Mail, ShieldCheck, Activity, Shield, Heart } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Authenticating..."></app-loading-spinner>

    <div class="min-h-screen bg-white dark:bg-slate-950 flex overflow-hidden">
      <!-- Left side: Hero Content (Hidden on mobile) -->
      <div class="hidden lg:flex lg:w-3/5 bg-slate-50 dark:bg-slate-900 flex-col justify-center p-12 relative overflow-hidden">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60"></div>
        
        <div class="relative z-10 max-w-2xl mx-auto">
          <div class="flex items-center gap-3 mb-8 cursor-pointer" routerLink="/">
            <div class="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <lucide-icon name="shield-check" class="h-8 w-8 text-white"></lucide-icon>
            </div>
            <span class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">HIMS Portal</span>
          </div>

          <h1 class="text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            Secure Access to your <br/>
            <span class="text-blue-600">Health Ecosystem.</span>
          </h1>

          <p class="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Manage your policies, track claims, and access your medical document vault with hospital-grade security and intelligent automation.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Features same as hero -->
             <div class="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <lucide-icon name="activity" class="h-6 w-6"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-slate-100">Intelligent Stats</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">Real-time tracking of your health journey.</p>
              </div>
            </div>
            <div class="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
              <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <lucide-icon name="shield" class="h-6 w-6"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-slate-100">Total Security</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">End-to-end encryption for all your data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Login Section -->
      <div class="w-full lg:w-2/5 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white dark:bg-slate-950">
        <div class="max-w-md w-full mx-auto">
          <!-- Back button for mobile -->
          <div class="lg:hidden mb-8">
            <div class="flex items-center gap-2 text-blue-600 font-bold" routerLink="/">
               <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
               <span>HIMS Portal</span>
            </div>
          </div>

          <div class="mb-10">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h2>
            <p class="text-slate-500 dark:text-slate-400">Enter your credentials to access the portal.</p>
          </div>

          <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <lucide-icon name="mail" class="h-5 w-5 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <!-- <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot?</a> -->
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <lucide-icon name="lock" class="h-5 w-5 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  id="password"
                  formControlName="password"
                  type="password"
                  class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full flex justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none transition-all transform active:scale-[0.98] items-center gap-2 disabled:opacity-70 disabled:grayscale"
            >
              @if (isLoading()) {
                <lucide-icon name="loader-2" class="h-5 w-5 animate-spin"></lucide-icon>
                Authenticating...
              } @else {
                <lucide-icon name="log-in" class="h-5 w-5"></lucide-icon>
                Sign In
              }
            </button>
          </form>

          <p class="mt-8 text-center text-slate-600 dark:text-slate-400">
            New here? 
            <a routerLink="/register" class="font-bold text-blue-600 hover:text-blue-500">Create Profile</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
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
      this.toastr.warning('Please enter valid credentials.', 'Form Invalid');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastr.success('Welcome back to HIMS!', 'Login Successful');

        const role = res.UserRole || res.userRole;
        switch (role?.toLowerCase()) {
          case 'admin': this.router.navigate(['/admin']); break;
          case 'customer': this.router.navigate(['/customer']); break;
          case 'agent': this.router.navigate(['/agent']); break;
          case 'claimsofficer': this.router.navigate(['/officer']); break;
          default: this.router.navigate(['/']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Authentication failed. Check your credentials.', 'Error');
      }
    });
  }
}
