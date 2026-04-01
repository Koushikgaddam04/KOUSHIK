import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import { ChatbotSupportComponent } from '../chatbot-support/chatbot-support.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule, ChatbotSupportComponent],
  template: `
    <app-chatbot-support></app-chatbot-support>
    <app-loading-spinner
      [show]="isLoading()"
      message="Loading your data..."
    ></app-loading-spinner>

    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Monitor your insurance policies and track your claims in real-time.</p>
      </div>
      <div class="flex flex-wrap gap-4 mt-4 md:mt-0">
        <button
          (click)="loadData()"
          [disabled]="isLoading()"
          class="inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-black rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-all active:scale-95"
        >
          <lucide-icon name="refresh-cw" class="mr-2 h-4 w-4"></lucide-icon>
          Sync Data
        </button>
        <a
          routerLink="/customer/quote"
          class="inline-flex items-center justify-center px-5 py-2.5 border border-blue-200 dark:border-blue-900/50 shadow-sm text-sm font-black rounded-2xl text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-900/10 focus:outline-none transition-all active:scale-95"
        >
          <lucide-icon name="file-search" class="mr-2 h-4 w-4"></lucide-icon>
          New Exploration
        </a>
        <a
          routerLink="/customer/claim"
          class="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-lg shadow-blue-500/20 text-sm font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all active:scale-95"
        >
          Submit Request
        </a>
      </div>
    </div>

    <!-- Analytics Section -->
    <section id="analytics" class="mb-12">
      <div class="flex items-center gap-3 mb-8">
         <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
            <lucide-icon name="pie-chart" class="h-6 w-6 text-indigo-600 dark:text-indigo-400"></lucide-icon>
         </div>
         <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Policy Analytics</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Coverage Usage Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 flex flex-col">
          <div class="flex items-center justify-between mb-8">
             <div>
                <h3 class="font-black text-slate-900 dark:text-white text-lg">Coverage Usage</h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Coverage vs Claims</p>
             </div>
          </div>
          <div class="relative min-h-[300px] flex items-center justify-center flex-1">
            <canvas #coverageChart></canvas>
          </div>
        </div>

        <!-- Claim Stats Overview -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 grid grid-cols-2 gap-6">
          <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl flex flex-col items-center justify-center group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-default">
            <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Claims</p>
            <p class="text-5xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300">{{ claimStats().total }}</p>
          </div>
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100/50 dark:border-emerald-800/30 p-6 rounded-3xl flex flex-col items-center justify-center group hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-default">
            <p class="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2">Approved</p>
            <p class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-500 group-hover:scale-110 transition-transform duration-300">{{ claimStats().approved }}</p>
          </div>
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100/50 dark:border-amber-800/30 p-6 rounded-3xl flex flex-col items-center justify-center group hover:shadow-lg hover:shadow-amber-500/5 transition-all cursor-default">
            <p class="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">Pending</p>
            <p class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-500 group-hover:scale-110 transition-transform duration-300">{{ claimStats().pending }}</p>
          </div>
          <div class="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/10 dark:to-red-900/10 border border-rose-100/50 dark:border-rose-800/30 p-6 rounded-3xl flex flex-col items-center justify-center group hover:shadow-lg hover:shadow-rose-500/5 transition-all cursor-default">
            <p class="text-[10px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-2">Rejected</p>
            <p class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-500 group-hover:scale-110 transition-transform duration-300">{{ claimStats().rejected }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- Separate Plans & Active Policies -->
    <section id="plans" class="mb-12">
      <div class="flex items-center gap-3 mb-8">
         <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
            <lucide-icon name="folder-open" class="h-6 w-6 text-blue-600 dark:text-blue-400"></lucide-icon>
         </div>
         <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Coverage Plans</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        @for (policy of activePolicies(); track policy.policyNumber) {
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 flex flex-col transform hover:-translate-y-2 group hover:border-blue-500/30">
            <div class="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div class="p-8 flex-1 flex flex-col relative">
              <div class="flex items-center justify-between mb-6">
                <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  {{ policy.status }}
                </span>
                <span class="text-xs font-black text-slate-400 tracking-tighter uppercase whitespace-nowrap bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">#POL-{{ policy.id }}</span>
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-50 dark:border-slate-800 pb-6 group-hover:text-blue-600 transition-colors">
                {{ policy.planName || 'Standard Package' }}
              </h3>
              
              <div class="space-y-6 mb-8 flex-1">
                <div class="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-4">
                  <span class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3">
                     <lucide-icon name="credit-card" class="h-4 w-4 text-purple-500"></lucide-icon> 
                     Monthly Premium
                  </span>
                  <span class="font-black text-slate-900 dark:text-white text-base">{{ (policy.premium || policy.monthlyPremium) | currency }}</span>
                </div>

                <!-- Coverage Usage Matrix -->
                <div class="space-y-4">
                   <div class="flex justify-between items-end">
                      <div class="flex flex-col">
                         <span class="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] mb-1">Coverage Utilization</span>
                         <span class="text-sm font-black text-slate-900 dark:text-white">Remaining: {{ policy.remainingAmount | currency }}</span>
                      </div>
                      <div class="text-right">
                         <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Used:</span>
                         <span class="text-[10px] font-black text-rose-500 block leading-none">{{ policy.usedAmount | currency }}</span>
                      </div>
                   </div>

                   <!-- Dual-Track Progress Bar -->
                   <div class="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                      <!-- Used Portion (Red) -->
                      <div class="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-1000" [style.width.%]="policy.usagePercent"></div>
                      <!-- Remaining Portion (Navy/Blue) -->
                      <div class="h-full bg-slate-900 dark:bg-blue-600 transition-all duration-1000" [style.width.%]="100 - policy.usagePercent"></div>
                   </div>

                   <div class="flex justify-between items-center px-1">
                      <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter">0%</span>
                      <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic">Total Limit: {{ policy.originalTotal | currency }}</span>
                      <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Usage: {{ policy.usagePercent | number:'1.0-0' }}%</span>
                   </div>
                </div>
              </div>

              <a routerLink="/customer/claim" [queryParams]="{ policyId: policy.id, sourceType: policy.sourceType }" class="group/btn w-full inline-flex justify-center items-center px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white hover:bg-blue-600 dark:hover:bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/40">
                Raise a Claim
                <lucide-icon name="arrow-right" class="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1.5 transition-transform"></lucide-icon>
              </a>
            </div>
          </div>
        } @empty {
          <div class="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-[40px] border border-dashed border-slate-300 dark:border-slate-700 py-20 flex flex-col items-center justify-center text-center">
             <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 mb-6 group hover:rotate-6 transition-transform">
                <lucide-icon name="file-question" class="h-10 w-10 text-slate-300"></lucide-icon>
             </div>
             <p class="text-slate-900 dark:text-white text-xl font-black tracking-tight">Vanguard Empty: No Active Policies</p>
             <p class="text-sm text-slate-500 font-medium mt-2 max-w-xs mx-auto">Your protection matrix is currently unassigned. Explore our premium plans today.</p>
             <a routerLink="/customer/quote" class="mt-8 inline-flex items-center px-8 py-3.5 bg-blue-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105">Deploy Quote Engine</a>
          </div>
        }

        <!-- Pending or Rejected Summaries -->
        @for (policy of pendingPolicies(); track policy.policyNumber) {
          <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-xl shadow-amber-500/20 p-8 flex flex-col justify-center relative overflow-hidden group">
            <div class="relative z-10">
                <div class="p-4 bg-white/20 rounded-2xl w-fit mb-6 text-white group-hover:scale-110 transition-transform">
                   <lucide-icon name="clock" class="h-8 w-8"></lucide-icon>
                </div>
                <span class="text-[10px] font-black text-amber-100 uppercase tracking-[0.2em] mb-3 block">
                  {{ policy.status === 'Payment Pending' ? 'Action Required' : 'Under Verification' }}
                </span>
                <h3 class="font-black text-white text-2xl mb-4 tracking-tight">{{ policy.planName }}</h3>
                <p class="text-sm text-amber-50 font-medium leading-relaxed mb-6">
                  {{ policy.status === 'Payment Pending' 
                     ? 'Strategic milestone achieved! Your policy is approved. Complete the premium payment to initiate immediate coverage.' 
                     : 'Our agents are meticulously validating your documents. Approval pending.' }}
                </p>

                @if (policy.status === 'Payment Pending') {
                  <a routerLink="/customer/policies" [queryParams]="{ quoteId: policy.id }" class="inline-flex justify-center items-center px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
                     Complete Payment
                     <lucide-icon name="arrow-right" class="ml-2 h-4 w-4"></lucide-icon>
                  </a>
                }
            </div>
            <!-- Glow effect -->
            <div class="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        }
      </div>
    </section>

    <!-- Claim Activity Section -->
    <section id="claim-activity">
      <div class="flex items-center gap-3 mb-8">
         <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
            <lucide-icon name="activity" class="h-6 w-6 text-emerald-600 dark:text-emerald-400"></lucide-icon>
         </div>
         <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Claims</h2>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
         <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
              <thead class="bg-slate-50/50 dark:bg-slate-800/80 backdrop-blur-md">
                <tr>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Claim ID</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Reason</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-slate-800/60">
                @for (claim of claims(); track claim.id) {
                  <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-300 group">
                    <td class="px-8 py-6 text-sm font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">#REQ-{{ claim.id }}</td>
                    <td class="px-8 py-6">
                       <span class="text-sm font-black text-slate-900 dark:text-white block truncate max-w-[240px] group-hover:text-blue-600 transition-colors">{{ claim.reason }}</span>
                    </td>
                    <td class="px-8 py-6 text-base font-black text-slate-900 dark:text-white">{{ claim.claimAmount | currency }}</td>
                    <td class="px-8 py-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{{ claim.createdAt | date:'MMM d, y':'+0530' }}</td>
                    <td class="px-8 py-6 text-right">
                       <span 
                        [ngClass]="{
                          'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100': claim.status === 'PendingApproval',
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100': claim.status === 'Approved',
                          'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-100': claim.status === 'Rejected'
                        }"
                        class="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border inline-flex items-center gap-2 shadow-sm"
                       >
                        <span class="w-2 h-2 rounded-full"
                          [ngClass]="{
                            'bg-amber-500 shadow-lg shadow-amber-500/40': claim.status === 'PendingApproval',
                            'bg-emerald-500 shadow-lg shadow-emerald-500/40': claim.status === 'Approved',
                            'bg-rose-500 shadow-lg shadow-rose-500/40': claim.status === 'Rejected'
                          }"></span>
                        {{ claim.status === 'PendingApproval' ? 'Verification' : claim.status }}
                       </span>
                    </td>
                  </tr>
                } @empty {
                   <tr>
                    <td colspan="5" class="px-8 py-20 text-center flex flex-col items-center justify-center">
                       <lucide-icon name="list-checks" class="h-12 w-12 text-slate-200 mb-4"></lucide-icon>
                       <p class="text-slate-400 font-bold italic text-sm">Registry Clear: No recent settlement activity detected.</p>
                    </td>
                   </tr>
                }
              </tbody>
            </table>
         </div>
      </div>
    </section>
  `
})
export class CustomerDashboardComponent implements OnInit, AfterViewInit {
  private customerService = inject(CustomerService);
  private toastr = inject(ToastrService);

  @ViewChild('coverageChart') coverageChartRef!: ElementRef;
  private donutChartInstance: Chart | null = null;

  policies = signal<any[]>([]);
  claims = signal<any[]>([]);
  isLoading = signal(false);

  enrichedPolicies = computed(() => {
    const policies = this.policies();
    const claims = this.claims();

    return policies.map(p => {
      // Correctly link claims based on whether this is a legacy Policy or a converted Quote
      const policyClaims = claims.filter(c =>
        (p.sourceType === 'Policy' && c.policyId === p.id) ||
        (p.sourceType === 'Quote' && c.premiumQuoteId === p.id)
      );

      const approvedClaims = policyClaims.filter(c => c.status === 'Approved');
      const usedAmount = approvedClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);

      // Original Total = Current Coverage + What we used so far
      const originalTotal = (p.coverageAmount || 0) + usedAmount;
      const usagePercent = originalTotal > 0 ? Math.min((usedAmount / originalTotal) * 100, 100) : 0;
      const remainingAmount = p.coverageAmount || 0;

      return {
        ...p,
        usedAmount,
        originalTotal,
        usagePercent,
        remainingAmount
      };
    });
  });

  activePolicies = computed(() => this.enrichedPolicies().filter(p => p.status === 'Active' || p.status === 'Inactive' || p.status === 'Locked'));
  pendingPolicies = computed(() => this.enrichedPolicies().filter(p => p.status === 'Pending' || p.status === 'Pending Review' || p.status === 'Payment Pending'));
  rejectedPolicies = computed(() => this.enrichedPolicies().filter(p => p.status === 'Rejected'));

  claimStats = computed(() => {
    const all = this.claims();
    return {
      total: all.length,
      pending: all.filter(c => c.status === 'PendingApproval').length,
      approved: all.filter(c => c.status === 'Approved').length,
      rejected: all.filter(c => c.status === 'Rejected').length
    };
  });

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  loadData() {
    this.isLoading.set(true);

    forkJoin({
      policies: this.customerService.getMyPolicies(),
      claims: this.customerService.getMyClaims()
    }).subscribe({
      next: ({ policies, claims }) => {
        this.policies.set(policies || []);
        this.claims.set(claims || []);
        this.isLoading.set(false);
        this.updateChart();
      },
      error: () => {
        this.toastr.error('Failed to load dashboard data.');
        this.isLoading.set(false);
      }
    });
  }

  initChart() {
    if (this.coverageChartRef) {
      const ctx = this.coverageChartRef.nativeElement.getContext('2d');
      this.donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Used Coverage (Claims)', 'Remaining Coverage'],
          datasets: [{
            data: [0, 100], // default
            backgroundColor: ['#ef4444', '#10b981'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
      this.updateChart();
    }
  }

  updateChart() {
    if (this.donutChartInstance) {
      const active = this.activePolicies();
      let totalBalance = 0;
      active.forEach(p => totalBalance += (p.coverageAmount || 0));

      const allClaims = this.claims();
      let totalUsed = 0;
      allClaims.forEach(c => {
        if (c.status === 'Approved') totalUsed += (c.claimAmount || 0);
      });

      const totalPie = totalBalance + totalUsed;

      if (totalPie === 0) {
        this.donutChartInstance.data.datasets[0].data = [0, 100];
      } else {
        // Red = totalUsed (Approved claims)
        // Green = totalBalance (Remaining in the policy)
        this.donutChartInstance.data.datasets[0].data = [totalUsed, totalBalance];
      }
      this.donutChartInstance.update();
    }
  }
}
