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

    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans selection:bg-blue-500/30">
      
      <!-- Animated Background Ornaments -->
      <div class="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-pulse"></div>
        <div class="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-400/10 dark:bg-indigo-600/5 blur-[120px] rounded-full delay-700 animate-pulse"></div>
      </div>

      <!-- Left side: Visual Content (Hidden on mobile) -->
      <div class="hidden lg:flex lg:w-[55%] bg-slate-950 flex-col justify-center p-20 relative overflow-hidden group">
        <!-- Background Image with Overlay -->
        <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
             class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[3000ms]" 
             alt="Security Background">
        <div class="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-blue-900/40"></div>
        
        <div class="relative z-10 space-y-12 animate-slide-up">
          <div class="flex items-center gap-4 cursor-pointer" routerLink="/">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/40 transform hover:rotate-6 transition-transform">
              <lucide-icon name="shield-check" class="h-8 w-8 text-white"></lucide-icon>
            </div>
            <span class="text-3xl font-black text-white tracking-tighter uppercase italic">HIMS</span>
          </div>

          <div class="space-y-6">
            <h1 class="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Gateway to <br/>
              <span class="text-blue-500">Digital Health.</span>
            </h1>
            <p class="text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
              Access your personalized insurance ecosystem. Secure, intelligent, and always under your control.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-8 pr-12">
            <div class="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl group/card hover:bg-white/10 transition-colors">
              <div class="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                <lucide-icon name="activity" class="h-6 w-6"></lucide-icon>
              </div>
              <h3 class="font-black text-white text-lg mb-2">Live Tracking</h3>
              <p class="text-sm text-slate-400 font-medium">Real-time lifecycle management for all your policies.</p>
            </div>
            <div class="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl group/card hover:bg-white/10 transition-colors">
              <div class="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                <lucide-icon name="shield" class="h-6 w-6"></lucide-icon>
              </div>
              <h3 class="font-black text-white text-lg mb-2">Advanced Security</h3>
              <p class="text-sm text-slate-400 font-medium">E2E encryption for all sensitive medical data.</p>
            </div>
          </div>
        </div>
        <div>.</div>
        <div>.</div>
        <!-- Decorative stats pill -->
        <div class="absolute bottom-20 left-20 animate-fade-in delay-500">
           <div class="px-6 py-3 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/50">
             Trusted by 1.2M+ Users
           </div>
        </div>
      </div>

      <!-- Right side: Login Section -->
      <div class="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-slate-950 relative z-10 shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.1)]">
        <div class="max-w-md w-full mx-auto space-y-10">
          
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
              Secure Authentication
            </div>
            <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Welcome Back.</h2>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Enter your credentials to manage your health ecosystem.</p>
          </div>

          <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="space-y-2">
              <label for="email" class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Corporate Email
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <lucide-icon name="mail" class="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"></lucide-icon>
                </div>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  class="block w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                  placeholder="example@gmail.com"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between ml-1">
                <label for="password" class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Secure Password
                </label>
              </div>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <lucide-icon name="lock" class="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"></lucide-icon>
                </div>
                <input
                  id="password"
                  formControlName="password"
                  type="password"
                  class="block w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="group relative w-full flex justify-center py-5 px-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black rounded-[1.5rem] shadow-2xl overflow-hidden transition-all transform active:scale-[0.98] disabled:opacity-70"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative flex items-center gap-3">
                @if (isLoading()) {
                  <lucide-icon name="loader-2" class="h-5 w-5 animate-spin"></lucide-icon>
                  <span>Verifying...</span>
                } @else {
                  <lucide-icon name="log-in" class="h-5 w-5 transform group-hover:translate-x-1 transition-transform"></lucide-icon>
                  <span>Access Portal</span>
                }
              </div>
            </button>
          </form>

          <div class="pt-8 border-t border-slate-100 dark:border-slate-900 text-center">
            <p class="text-slate-500 dark:text-slate-400 font-bold">
              New to the platform? 
              <a routerLink="/register" class="text-blue-600 hover:text-blue-500 ml-1 transition-colors">Start Application</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-fade-in { animation: fade-in 1s ease-out forwards; }
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
