import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShieldCheck, Sun, Moon, ArrowRight, Activity, Shield, Heart, Zap, Play, CheckCircle2 } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <!-- Premium Navbar -->
      <nav class="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Logo -->
            <div class="flex items-center gap-2.5 group cursor-pointer">
              <div class="p-2 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <lucide-icon name="shield-check" class="h-6 w-6 text-white"></lucide-icon>
              </div>
              <span class="text-xl font-bold tracking-tight">HIMS Portal</span>
            </div>

            <!-- Nav Links (Desktop) -->
            <div class="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-400">
              <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
              <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Solutions</a>
              <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-4">
              <!-- Dark Mode Toggle -->
              <button 
                (click)="toggleDarkMode()"
                class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
              >
                @if (isDarkMode()) {
                  <lucide-icon name="sun" class="h-5 w-5"></lucide-icon>
                } @else {
                  <lucide-icon name="moon" class="h-5 w-5"></lucide-icon>
                }
              </button>

              <button 
                routerLink="/login"
                class="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Login
                <lucide-icon name="arrow-right" class="h-4 w-4"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="pt-32 pb-20 px-4">
        <div class="max-w-7xl mx-auto">
          <div class="text-center space-y-8 max-w-4xl mx-auto">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-sm font-bold animate-fade-in">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              New: Automated Claim Processing v2.0
            </div>

            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-[1.1]">
              The Operating System for <br/>
              <span class="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Health Insurance.</span>
            </h1>

            <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Experience the future of healthcare management. HIMS provides agents, officers, and customers a unified platform to manage policies with speed and precision.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                routerLink="/register"
                class="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
              >
                Get Started Free
              </button>
              <button class="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <lucide-icon name="play" class="h-5 w-5"></lucide-icon>
                Watch Demo
              </button>
            </div>
          </div>

          <!-- Dashboard Mockup/Visual -->
          <div class="mt-20 relative px-4 sm:px-10">
            <div class="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/5 blur-3xl rounded-full -z-10 transform scale-75"></div>
            <div class="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] max-w-5xl mx-auto p-4 flex flex-col">
               <!-- Mockup UI Header -->
               <div class="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-400"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div class="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div class="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
               </div>
               <!-- Mockup UI Content -->
               <div class="grid grid-cols-3 gap-6 flex-1">
                  <div class="col-span-2 space-y-6">
                    <div class="h-32 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                    <div class="h-48 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div class="space-y-6">
                    <div class="h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="py-20 border-t border-slate-100 dark:border-slate-900">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p class="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-12 italic">Trusted by 10,000+ medical institutions worldwide</p>
          <div class="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 dark:opacity-20 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            <span class="text-3xl font-black">HEALTH+</span>
            <span class="text-3xl font-black italic">VITALSCAN</span>
            <span class="text-3xl font-black tracking-tighter">MEDCORE</span>
            <span class="text-3xl font-black">BIOSECURE</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
  `]
})
export class HomeComponent {
  isDarkMode = signal(false);

  constructor() {
    // Initial theme check
    this.isDarkMode.set(document.documentElement.classList.contains('dark'));

    // Sync logic
    effect(() => {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
  }
}
