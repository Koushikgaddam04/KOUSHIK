import { Component, signal, effect, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShieldCheck, Sun, Moon, ArrowRight, Activity, Shield, Heart, Zap, Play, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-angular';

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
            <div class="flex items-center gap-2.5 group cursor-pointer" routerLink="/">
              <div class="p-2 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
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
                <!-- Changed from @if to [name] binding to prevent component recreation delays -->
                <lucide-icon [name]="isDarkMode() ? 'sun' : 'moon'" class="h-5 w-5"></lucide-icon>
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

          <!-- Dynamic Premium Carousel -->
          <div class="mt-20 relative group">
            <div class="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/5 blur-3xl rounded-full -z-10 transform scale-75"></div>
            
            <div class="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950 aspect-[16/9] md:aspect-[21/9] max-w-6xl mx-auto">
              <!-- Carousel Slides -->
              <div 
                class="flex transition-transform duration-700 ease-out h-full"
                [style.transform]="'translateX(-' + currentSlide() * 100 + '%)'"
              >
                @for (slide of slides; track slide.title) {
                  <div class="w-full h-full flex-shrink-0 relative">
                    <img [src]="slide.image" [alt]="slide.title" fetchpriority="high" loading="eager" class="w-full h-full object-cover opacity-80 dark:opacity-60">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-2xl animate-slide-up">
                      <div class="flex items-center gap-2 text-blue-400 font-bold mb-4">
                        <lucide-icon [name]="slide.icon" class="h-5 w-5"></lucide-icon>
                        <span class="uppercase tracking-widest text-xs">{{ slide.category }}</span>
                      </div>
                      <h2 class="text-3xl md:text-5xl font-bold mb-4">{{ slide.title }}</h2>
                      <p class="text-lg text-slate-300 leading-relaxed mb-8">{{ slide.description }}</p>
                      <button class="flex items-center gap-2 text-white font-bold hover:gap-4 transition-all group/btn">
                        Learn more <lucide-icon name="arrow-right" class="h-4 w-4 group-hover/btn:scale-125 transition-transform"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Controls -->
              <button 
                (click)="prevSlide()"
                class="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
              >
                <lucide-icon name="chevron-left" class="h-6 w-6"></lucide-icon>
              </button>
              <button 
                (click)="nextSlide()"
                class="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
              >
                <lucide-icon name="chevron-right" class="h-6 w-6"></lucide-icon>
              </button>

              <!-- Indicators -->
              <div class="absolute bottom-8 right-8 flex gap-3">
                @for (slide of slides; track $index) {
                  <button 
                    (click)="setSlide($index)"
                    class="h-1.5 rounded-full transition-all duration-300"
                    [class]="currentSlide() === $index ? 'w-8 bg-blue-500' : 'w-3 bg-white/30'"
                  ></button>
                }
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
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
    .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private cdRef = inject(ChangeDetectorRef);
  isDarkMode = signal(false);
  currentSlide = signal(0);
  private intervalId?: any;

  slides = [
    {
      category: 'Efficiency',
      title: 'Automated Claim Lifecycle',
      description: 'Our proprietary AI engine processes 90% of routine claims in under 30 seconds, allowing officers to focus on complex cases.',
      icon: 'zap',
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=2070'
    },
    {
      category: 'Security',
      title: 'Military-Grade Data Vault',
      description: 'Your medical records and sensitive documents are encrypted using AES-256 standards with zero-knowledge architecture.',
      icon: 'shield',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070'
    },
    {
      category: 'Care',
      title: 'Unified Customer Experience',
      description: 'From instant quotes to policy management, we provide a seamless digital journey for your health insurance needs.',
      icon: 'heart',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070'
    }
  ];

  constructor() {
    this.isDarkMode.set(document.documentElement.classList.contains('dark'));

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

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  ngAfterViewInit() {
    // Force a rendering pass after elements are mounted so all Lucide SVG icons load instantly
    this.cdRef.detectChanges();
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    this.cdRef.detectChanges();
  }

  nextSlide() {
    this.currentSlide.update(v => (v + 1) % this.slides.length);
    this.resetAutoPlay();
    this.cdRef.detectChanges();
  }

  prevSlide() {
    this.currentSlide.update(v => (v - 1 + this.slides.length) % this.slides.length);
    this.resetAutoPlay();
    this.cdRef.detectChanges();
  }

  setSlide(index: number) {
    this.currentSlide.set(index);
    this.resetAutoPlay();
    this.cdRef.detectChanges();
  }

  private startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.currentSlide.update(v => (v + 1) % this.slides.length);
      this.cdRef.detectChanges();
    }, 5000);
  }

  private stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

