import { Component, signal, effect, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  ShieldCheck, 
  Sun, 
  Moon, 
  ArrowRight, 
  Activity, 
  Shield, 
  Heart, 
  Zap, 
  Play, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Cloud,
  Lock,
  Cpu,
  Smartphone,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Star,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  BarChart,
  Layers,
  Check
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans selection:bg-blue-500/30">
      
      <!-- Premium Navbar -->
      <nav class="fixed top-0 w-full z-[100] transition-all duration-300" [class]="scrolled() ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-3' : 'bg-transparent py-6'">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <!-- Logo -->
            <div class="flex items-center gap-3 group cursor-pointer" routerLink="/">
              <div class="relative">
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative p-2.5 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-blue-500/20">
                  <lucide-icon name="shield-check" class="h-6 w-6 text-white"></lucide-icon>
                </div>
              </div>
              <span class="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">HIMS</span>
            </div>

            <!-- Nav Links (Desktop) -->
            <div class="hidden lg:flex items-center gap-10 font-semibold text-slate-600 dark:text-slate-400">
              <button (click)="scrollTo('features')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:-translate-y-0.5">Features</button>
              <button (click)="scrollTo('solutions')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:-translate-y-0.5">Solutions</button>
              <button (click)="scrollTo('pricing')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:-translate-y-0.5">Pricing</button>
              <button (click)="scrollTo('about')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:-translate-y-0.5">About Us</button>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-5">
              <!-- Dark Mode Toggle -->
              <button 
                (click)="toggleDarkMode()"
                class="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md active:scale-90"
              >
                <lucide-icon [name]="isDarkMode() ? 'sun' : 'moon'" class="h-5 w-5"></lucide-icon>
              </button>

              <div class="hidden sm:flex items-center gap-4">
                <button routerLink="/login" class="px-5 py-2.5 font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</button>
                <button 
                  routerLink="/register"
                  class="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
                >
                  Join HIMS
                  <lucide-icon name="arrow-right" class="h-4 w-4"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-40 pb-32 overflow-hidden">
        <!-- Abstract Background Ornaments -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-pulse"></div>
          <div class="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-400/10 dark:bg-indigo-600/5 blur-[120px] rounded-full delay-700 animate-pulse"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-widest mb-10 animate-fade-in shadow-sm">
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Next-Gen Healthtech Ecosystem
            </div>

            <h1 class="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] mb-8 animate-slide-up">
              Revolutionizing <span class="text-blue-600">Insurance</span> <br/>
              <span class="relative">
                For Everyone.
                <svg class="absolute -bottom-4 left-0 w-full h-3 text-blue-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" stroke-width="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p class="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in opacity-0 [animation-delay:200ms]">
              HIMS is the heartbeat of modern health insurance management. A unified platform engineered for speed, security, and absolute transparency.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in opacity-0 [animation-delay:400ms]">
              <button 
                routerLink="/register"
                class="group relative w-full sm:w-auto px-10 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl overflow-hidden shadow-slate-900/20"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="relative">Start Your Journey</span>
              </button>
              <button 
                (click)="scrollTo('performance')"
                class="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl"
              >
                <div class="p-1.5 bg-blue-500/10 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                  <lucide-icon name="play" class="h-5 w-5 fill-current"></lucide-icon>
                </div>
                View Performance
              </button>
            </div>
        </div>
      </section>

      <!-- Stats Bar Section -->
      <section class="py-12 relative">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 px-8 bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl">
            <div class="text-center group border-r border-slate-100 dark:border-slate-800 last:border-0 p-4">
              <div class="text-4xl md:text-5xl font-black text-blue-600 mb-2 group-hover:scale-110 transition-transform">1.2M+</div>
              <div class="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Policies</div>
            </div>
            <div class="text-center group border-r border-slate-100 dark:border-slate-800 last:border-0 p-4">
              <div class="text-4xl md:text-5xl font-black text-emerald-500 mb-2 group-hover:scale-110 transition-transform">$500M</div>
              <div class="text-sm font-bold text-slate-500 uppercase tracking-widest">Claims Paid</div>
            </div>
            <div class="text-center group border-r border-slate-100 dark:border-slate-800 last:border-0 p-4">
              <div class="text-4xl md:text-5xl font-black text-indigo-500 mb-2 group-hover:scale-110 transition-transform">99.9%</div>
              <div class="text-sm font-bold text-slate-500 uppercase tracking-widest">Processing Accuracy</div>
            </div>
            <div class="text-center group p-4">
              <div class="text-4xl md:text-5xl font-black text-orange-500 mb-2 group-hover:scale-110 transition-transform">< 10s</div>
              <div class="text-sm font-bold text-slate-500 uppercase tracking-widest">Average Response</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Visual Carousel -->
      <section id="solutions" class="py-24">
        <div class="max-w-7xl mx-auto px-4">
          <div class="relative group h-[500px] md:h-[650px] overflow-hidden rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] bg-slate-950">
            <!-- Carousel Slides -->
            <div 
              class="flex transition-transform duration-1000 carousel-custom-timing h-full"
              [style.transform]="'translateX(-' + currentSlide() * 100 + '%)'"
            >
              @for (slide of slides; track slide.title) {
                <div class="w-full h-full flex-shrink-0 relative group/slide">
                  <img [src]="slide.image" [alt]="slide.title" class="w-full h-full object-cover opacity-80 group-hover/slide:scale-105 transition-transform duration-[2000ms]">
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  <div class="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent"></div>
                  
                  <div class="absolute bottom-0 left-0 p-10 md:p-20 text-white max-w-3xl">
                    <div class="flex items-center gap-3 text-blue-400 font-black mb-6 animate-fade-in">
                      <div class="p-2 bg-blue-500/20 rounded-lg backdrop-blur-md">
                        <lucide-icon [name]="slide.icon" class="h-6 w-6"></lucide-icon>
                      </div>
                      <span class="uppercase tracking-[0.3em] text-sm">{{ slide.category }}</span>
                    </div>
                    <h2 class="text-4xl md:text-6xl font-black mb-6 leading-tight">{{ slide.title }}</h2>
                    <p class="text-xl text-slate-300 leading-relaxed mb-10">{{ slide.description }}</p>
                    <button class="flex items-center gap-4 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold transition-all group/btn">
                      Explore this Module 
                      <lucide-icon name="arrow-right" class="h-5 w-5 group-hover/btn:translate-x-2 transition-transform"></lucide-icon>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Controls overlay -->
            <div class="absolute inset-y-0 left-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="prevSlide()" class="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all">
                <lucide-icon name="chevron-left" class="h-8 w-8"></lucide-icon>
              </button>
            </div>
            <div class="absolute inset-y-0 right-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="nextSlide()" class="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all">
                <lucide-icon name="chevron-right" class="h-8 w-8"></lucide-icon>
              </button>
            </div>

            <!-- Enhanced Indicators -->
            <div class="absolute bottom-10 right-10 flex items-center gap-4">
              <div class="text-white/50 font-black text-sm tracking-widest">0{{currentSlide() + 1}} / 0{{slides.length}}</div>
              <div class="flex gap-2">
                @for (slide of slides; track $index) {
                  <button 
                    (click)="setSlide($index)"
                    class="h-1.5 rounded-full transition-all duration-500"
                    [class]="currentSlide() === $index ? 'w-12 bg-blue-500' : 'w-4 bg-white/20'"
                  ></button>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced Features Grid -->
      <section id="features" class="py-32 bg-slate-100/50 dark:bg-slate-900/20">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-20 space-y-4">
            <h2 class="text-sm font-black text-blue-600 uppercase tracking-[0.4em]">Core Capabilities</h2>
            <h3 class="text-4xl md:text-5xl font-black">Built for the modern era.</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Everything you need to manage complex insurance lifecycles under one roof.</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
              <div class="relative z-10">
                <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <lucide-icon name="zap" class="h-8 w-8"></lucide-icon>
                </div>
                <h4 class="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors">Instant Processing</h4>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Automatic claim validation using our proprietary Nexus engine for split-second decisions.</p>
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
               <div class="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
               <div class="relative z-10">
                <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <lucide-icon name="shield-check" class="h-8 w-8"></lucide-icon>
                </div>
                <h4 class="text-2xl font-black mb-4 group-hover:text-emerald-500 transition-colors">Zero-Trust Security</h4>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">E2E encryption for all medical records and PII data, remaining compliant with global standards.</p>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
              <div class="relative z-10">
                <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <lucide-icon name="globe" class="h-8 w-8"></lucide-icon>
                </div>
                <h4 class="text-2xl font-black mb-4 group-hover:text-indigo-600 transition-colors">Global Network</h4>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Access to 50,000+ medical facilities worldwide through a single unified digital health passport.</p>
              </div>
            </div>
            
            <!-- Feature 4 -->
            <div class="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
               <div class="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
               <div class="relative z-10">
                <div class="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <lucide-icon name="activity" class="h-8 w-8"></lucide-icon>
                </div>
                <h4 class="text-2xl font-black mb-4 group-hover:text-orange-600 transition-colors">Real-time Insights</h4>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Comprehensive dashboards for agents and officers to track every KPI in real-time.</p>
              </div>
            </div>

            <!-- Feature 5 -->
            <div class="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
               <div class="absolute -right-8 -top-8 w-32 h-32 bg-pink-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
               <div class="relative z-10">
                <div class="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 text-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <lucide-icon name="smartphone" class="h-8 w-8"></lucide-icon>
                </div>
                <h4 class="text-2xl font-black mb-4 group-hover:text-pink-600 transition-colors">Mobile First</h4>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Manage your health and claims on the go with our award-winning native mobile applications.</p>
              </div>
            </div>

            <!-- Feature 6 -->
            <div class="group p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
               <div class="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/5 rounded-full group-hover:scale-[3] transition-transform duration-700"></div>
               <div class="relative z-10">
                <div class="w-16 h-16 bg-violet-50 dark:bg-violet-500/10 text-violet-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <lucide-icon name="cloud" class="h-8 w-8"></lucide-icon>
                </div>
                <h4 class="text-2xl font-black mb-4 group-hover:text-violet-600 transition-colors">Cloud Native</h4>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Highly scalable architecture that grows with your institution without performance compromises.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works / Process Section -->
      <section class="py-32 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="space-y-12">
               <div>
                  <h2 class="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-4">The Workflow</h2>
                  <h3 class="text-4xl md:text-5xl font-black leading-tight">Complex tasks made <br/><span class="text-blue-600">effortlessly simple.</span></h3>
               </div>

               <div class="space-y-8">
                  <div class="flex gap-6 group">
                    <div class="flex-shrink-0 w-12 h-12 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">01</div>
                    <div>
                      <h4 class="text-xl font-bold mb-2">Apply Online</h4>
                      <p class="text-slate-500 dark:text-slate-400">Upload documents and fill your digital health profile in minutes from any device.</p>
                    </div>
                  </div>
                  <div class="flex gap-6 group">
                    <div class="flex-shrink-0 w-12 h-12 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">02</div>
                    <div>
                      <h4 class="text-xl font-bold mb-2">Automated Verification</h4>
                      <p class="text-slate-500 dark:text-slate-400">Our Nexus engine cross-verifies data with medical networks for instant validation.</p>
                    </div>
                  </div>
                  <div class="flex gap-6 group">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">03</div>
                    <div>
                      <h4 class="text-xl font-bold mb-2 text-blue-600">Get Approved</h4>
                      <p class="text-slate-500 dark:text-slate-400">Receive digital policy documents and your health card immediately upon approval.</p>
                    </div>
                  </div>
               </div>

               <button routerLink="/register" class="flex items-center gap-3 font-black text-lg hover:gap-5 transition-all text-blue-600 uppercase tracking-widest">
                 Start your application <lucide-icon name="arrow-right" class="h-6 w-6"></lucide-icon>
               </button>
            </div>

            <div class="relative">
               <div class="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[3rem] blur-2xl opacity-10 animate-pulse"></div>
               <img src="https://images.unsplash.com/photo-1576091160550-217359f4981c?auto=format&fit=crop&q=80&w=2070" alt="Platform usage" class="relative rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800">
               
               <!-- Floating Stats Card -->
               <div class="absolute -bottom-10 -left-10 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                      <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
                    </div>
                    <div>
                      <div class="text-2xl font-black">Verified</div>
                      <div class="text-sm font-bold text-slate-400">Zero-error Rate</div>
                    </div>
                  </div>
                  <div class="flex gap-1 text-yellow-500">
                    <lucide-icon name="star" class="h-4 w-4 fill-current"></lucide-icon>
                    <lucide-icon name="star" class="h-4 w-4 fill-current"></lucide-icon>
                    <lucide-icon name="star" class="h-4 w-4 fill-current"></lucide-icon>
                    <lucide-icon name="star" class="h-4 w-4 fill-current"></lucide-icon>
                    <lucide-icon name="star" class="h-4 w-4 fill-current"></lucide-icon>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Performance Insights Section -->
      <section id="performance" class="py-32 relative overflow-hidden bg-slate-950 text-white">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        
        <div class="max-w-7xl mx-auto px-4 relative">
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="lg:w-1/2 space-y-8">
              <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest">
                <lucide-icon name="trending-up" class="h-4 w-4"></lucide-icon>
                Live Performance Metrics
              </div>
              <h2 class="text-5xl font-black leading-tight">Scale without <br/><span class="text-blue-500">Limits.</span></h2>
              <p class="text-slate-400 text-lg leading-relaxed">
                HIMS is designed for extreme scale. Our distributed architecture ensures that performance never degrades, even during peak claim periods. Monitor your system health in real-time.
              </p>
              
              <div class="grid grid-cols-2 gap-6">
                <div class="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <div class="text-3xl font-black text-blue-500 mb-1">0.12ms</div>
                  <div class="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Latency</div>
                </div>
                <div class="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <div class="text-3xl font-black text-emerald-500 mb-1">99.99%</div>
                  <div class="text-sm font-bold text-slate-500 uppercase tracking-wider">Uptime SLA</div>
                </div>
              </div>
            </div>
            
            <div class="lg:w-1/2 w-full">
              <div class="p-8 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl relative group overflow-hidden">
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div class="relative space-y-6">
                  <div class="flex justify-between items-center">
                    <h4 class="font-black flex items-center gap-2">
                       <lucide-icon name="bar-chart" class="h-5 w-5 text-blue-500"></lucide-icon>
                       Network Load
                    </h4>
                    <span class="text-xs font-bold text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-md">HEALTHY</span>
                  </div>
                  
                  <!-- Fake Chart Simulation -->
                  <div class="h-48 flex items-end gap-2">
                    <div class="flex-1 bg-blue-600/40 rounded-t-lg transition-all duration-1000" [style.height.%]="20 + (currentSlide() * 10)"></div>
                    <div class="flex-1 bg-blue-600/60 rounded-t-lg transition-all duration-1000" [style.height.%]="40 + (currentSlide() * 15)"></div>
                    <div class="flex-1 bg-blue-600/30 rounded-t-lg transition-all duration-1000" [style.height.%]="30 + (currentSlide() * 5)"></div>
                    <div class="flex-1 bg-blue-600/80 rounded-t-lg transition-all duration-1000" [style.height.%]="60 + (currentSlide() * 20)"></div>
                    <div class="flex-1 bg-blue-600/50 rounded-t-lg transition-all duration-1000" [style.height.%]="45 + (currentSlide() * 8)"></div>
                    <div class="flex-1 bg-blue-600/70 rounded-t-lg transition-all duration-1000" [style.height.%]="70 + (currentSlide() * 12)"></div>
                    <div class="flex-1 bg-blue-600/40 rounded-t-lg transition-all duration-1000" [style.height.%]="25 + (currentSlide() * 18)"></div>
                  </div>
                  
                  <div class="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="py-32 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-20">
            <h2 class="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Investment Plans</h2>
            <h3 class="text-4xl md:text-5xl font-black mb-6">Simple, Transparent <br/> <span class="text-blue-600">Pricing for Everyone.</span></h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">Choose the insurance ecosystem that scales with your organization's needs.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- Starter -->
            <div class="p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all hover:shadow-2xl group">
              <div class="mb-10">
                <h4 class="text-xl font-black mb-2">Starter</h4>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-black text-slate-900 dark:text-white">$99</span>
                  <span class="text-slate-500 dark:text-slate-400 font-bold">/mo</span>
                </div>
              </div>
              <ul class="space-y-4 mb-10">
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Up to 1,000 Policies
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Basic AI Processing
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Standard Security
                </li>
              </ul>
              <button class="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors">Start Free Trial</button>
            </div>

            <!-- Business -->
            <div class="p-10 rounded-[2.5rem] border-2 border-blue-600 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden scale-105 z-10">
              <div class="absolute top-0 right-0 px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl">Most Popular</div>
              <div class="mb-10">
                <h4 class="text-xl font-black text-blue-600 mb-2">Professional</h4>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-black text-slate-900 dark:text-white">$499</span>
                  <span class="text-slate-500 dark:text-slate-400 font-bold">/mo</span>
                </div>
              </div>
              <ul class="space-y-4 mb-10">
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Unlimited Policies
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Advanced Nexus AI
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  E2E Encryption
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Priority 24/7 Support
                </li>
              </ul>
              <button class="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">Get Started Now</button>
            </div>

            <!-- Enterprise -->
            <div class="p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all hover:shadow-2xl group">
              <div class="mb-10">
                <h4 class="text-xl font-black mb-2">Enterprise</h4>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-black text-slate-900 dark:text-white">Custom</span>
                </div>
              </div>
              <ul class="space-y-4 mb-10">
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Full Multi-tenant Support
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  SLA Guarantee
                </li>
                <li class="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <lucide-icon name="check" class="h-5 w-5 text-emerald-500"></lucide-icon>
                  Custom Integrations
                </li>
              </ul>
              <button class="w-full py-4 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <!-- About Us Section -->
      <section id="about" class="py-32 bg-slate-50 dark:bg-slate-900/10">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="relative group">
              <div class="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div class="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000" alt="Team 1" class="rounded-3xl shadow-xl hover:scale-105 transition-transform duration-500 mt-12">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" alt="Team 2" class="rounded-3xl shadow-xl hover:scale-105 transition-transform duration-500">
              </div>
            </div>
            
            <div class="space-y-8">
              <h2 class="text-sm font-black text-blue-600 uppercase tracking-[0.4em]">Our Story</h2>
              <h3 class="text-4xl md:text-5xl font-black leading-tight">Human-Centric <br/><span class="text-blue-600">Health Innovation.</span></h3>
              <p class="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                HIMS was founded on a simple premise: Health insurance should be a support system, not a bureaucratic nightmare. We've spent the last decade perfecting the blend of artificial intelligence and human compassion.
              </p>
              
              <div class="space-y-6">
                <div class="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div class="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <lucide-icon name="heart" class="h-6 w-6"></lucide-icon>
                  </div>
                  <div>
                    <h4 class="font-bold text-lg mb-1">Our Values</h4>
                    <p class="text-slate-400 text-sm">Integrity, Transparency, and relentless focus on the patient experience.</p>
                  </div>
                </div>
                <div class="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div class="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <lucide-icon name="award" class="h-6 w-6"></lucide-icon>
                  </div>
                  <div>
                    <h4 class="font-bold text-lg mb-1">Our Mission</h4>
                    <p class="text-slate-400 text-sm">Providing accessible health management tools to 1 billion people by 2030.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Badges Section -->
      <section class="py-20 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p class="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] mb-12">Global Partnerships</p>
          <div class="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 dark:opacity-20 transition-all">
            <div class="flex items-center gap-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <lucide-icon name="activity" class="h-8 w-8 text-blue-600"></lucide-icon>
              <span class="text-2xl font-black italic">HEALTH+</span>
            </div>
            <div class="flex items-center gap-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <lucide-icon name="monitor" class="h-8 w-8 text-indigo-600"></lucide-icon>
              <span class="text-2xl font-black tracking-tighter uppercase">VitalScan</span>
            </div>
            <div class="flex items-center gap-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <lucide-icon name="cpu" class="h-8 w-8 text-slate-800 dark:text-white"></lucide-icon>
              <span class="text-2xl font-black">MEDCORE</span>
            </div>
            <div class="flex items-center gap-3 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <lucide-icon name="lock" class="h-8 w-8 text-emerald-600"></lucide-icon>
              <span class="text-2xl font-black italic">BIOSECURE</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Premium Footer -->
      <footer class="bg-slate-950 dark:bg-black text-slate-300 py-32 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
        
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div class="space-y-8">
              <div class="flex items-center gap-3 group cursor-pointer">
                <div class="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                  <lucide-icon name="shield-check" class="h-6 w-6 text-white"></lucide-icon>
                </div>
                <span class="text-2xl font-black tracking-tight text-white">HIMS</span>
              </div>
              <p class="text-slate-400 leading-relaxed font-medium">
                Pioneering the future of health insurance management with AI-driven processing and military-grade security.
              </p>
              <div class="flex gap-5">
                <a href="#" class="p-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg transition-all hover:-translate-y-1"><lucide-icon name="twitter" class="h-5 w-5"></lucide-icon></a>
                <a href="#" class="p-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg transition-all hover:-translate-y-1"><lucide-icon name="linkedin" class="h-5 w-5"></lucide-icon></a>
                <a href="#" class="p-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg transition-all hover:-translate-y-1"><lucide-icon name="instagram" class="h-5 w-5"></lucide-icon></a>
                <a href="#" class="p-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg transition-all hover:-translate-y-1"><lucide-icon name="facebook" class="h-5 w-5"></lucide-icon></a>
              </div>
            </div>

            <div>
              <h5 class="text-white font-black text-sm uppercase tracking-widest mb-10">Solutions</h5>
              <ul class="space-y-4 font-bold">
                <li><button (click)="scrollTo('features')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">Digital Policies</button></li>
                <li><button (click)="scrollTo('solutions')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">Claim Hub</button></li>
                <li><button (click)="scrollTo('performance')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">System Performance</button></li>
                <li><button (click)="scrollTo('solutions')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">Global Network</button></li>
              </ul>
            </div>

            <div>
              <h5 class="text-white font-black text-sm uppercase tracking-widest mb-10">Company</h5>
              <ul class="space-y-4 font-bold">
                <li><button (click)="scrollTo('about')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">Our Vision</button></li>
                <li><button (click)="scrollTo('about')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">About Us</button></li>
                <li><button (click)="scrollTo('pricing')" class="bg-transparent border-none p-0 cursor-pointer hover:text-blue-500 transition-colors text-left">Pricing</button></li>
                <li><a href="#" class="hover:text-blue-500 transition-colors">Privacy</a></li>
              </ul>
            </div>

            <div>
              <h5 class="text-white font-black text-sm uppercase tracking-widest mb-10">Contact</h5>
              <ul class="space-y-6 font-medium">
                <li class="flex gap-4">
                  <lucide-icon name="mail" class="h-5 w-5 text-blue-500"></lucide-icon>
                  <span>solutions&#64;hims-portal.com</span>
                </li>
                <li class="flex gap-4">
                  <lucide-icon name="phone" class="h-5 w-5 text-blue-500"></lucide-icon>
                  <span>+1 (800) HIMS-01</span>
                </li>
                <li class="flex gap-4">
                  <lucide-icon name="map-pin" class="h-5 w-5 text-blue-500"></lucide-icon>
                  <span class="leading-relaxed">1200 Innovation Drive,<br/>Silicon Valley, CA 94025</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <p class="text-slate-500 text-sm font-bold uppercase tracking-widest">© 2026 HIMS Global. All rights reserved.</p>
            <div class="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" class="hover:text-white transition-colors">Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    html {
      scroll-behavior: smooth;
    }

    .carousel-custom-timing {
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private cdRef = inject(ChangeDetectorRef);
  isDarkMode = signal(false);
  currentSlide = signal(0);
  scrolled = signal(false);
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
      category: 'Intelligence',
      title: 'Smart Underwriting Dashboards',
      description: 'Actionable intelligence at your fingertips. Agents and officers get real-time risk assessments for every policy holder.',
      icon: 'activity',
      image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=2070'
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
    window.addEventListener('scroll', this.handleScroll);
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    window.removeEventListener('scroll', this.handleScroll);
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  handleScroll = () => {
    this.scrolled.set(window.scrollY > 50);
    this.cdRef.detectChanges();
  };

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

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  private startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.currentSlide.update(v => (v + 1) % this.slides.length);
      this.cdRef.detectChanges();
    }, 7000);
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

