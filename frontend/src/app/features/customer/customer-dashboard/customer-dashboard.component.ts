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

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner
      [show]="isLoading()"
      message="Loading your data..."
    ></app-loading-spinner>

    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">My Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your active policies and track claims.</p>
      </div>
      <div class="flex gap-3">
        <button
          (click)="loadData()"
          [disabled]="isLoading()"
          class="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <lucide-icon name="refresh-cw" class="mr-2 h-4 w-4"></lucide-icon>
          Refresh
        </button>
        <a
          routerLink="/customer/quote"
          class="inline-flex items-center justify-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 dark:border-blue-500 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 focus:outline-none transition-colors"
        >
          <lucide-icon name="file-search" class="mr-2 h-4 w-4"></lucide-icon>
          Get New Quote
        </a>
        <a
          routerLink="/customer/claim"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
        >
          Submit Claim
        </a>
      </div>
    </div>

    <!-- Analytics Section -->
    <section id="analytics" class="mb-10">
      <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
         <lucide-icon name="pie-chart" class="h-6 w-6 text-indigo-500"></lucide-icon>
         Analytics
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Coverage Usage Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="font-semibold text-slate-800 dark:text-slate-100 mb-4">Total Coverage vs Claims</h3>
          <div class="relative min-h-[250px] flex items-center justify-center">
            <canvas #coverageChart></canvas>
          </div>
        </div>

        <!-- Claim Stats Overview -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-2 gap-4">
          <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col items-center justify-center">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Claims</p>
            <p class="text-3xl font-black text-slate-800 dark:text-white mt-2">{{ claimStats().total }}</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900 p-4 rounded-lg flex flex-col items-center justify-center">
            <p class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Approved</p>
            <p class="text-3xl font-black text-green-700 dark:text-green-500 mt-2">{{ claimStats().approved }}</p>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900 p-4 rounded-lg flex flex-col items-center justify-center">
            <p class="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Pending</p>
            <p class="text-3xl font-black text-yellow-700 dark:text-yellow-500 mt-2">{{ claimStats().pending }}</p>
          </div>
          <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 p-4 rounded-lg flex flex-col items-center justify-center">
            <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Rejected</p>
            <p class="text-3xl font-black text-red-700 dark:text-red-500 mt-2">{{ claimStats().rejected }}</p>
          </div>
        </div>

      </div>
    </section>

    <!-- Separate Plans & Active Policies -->
    <section id="plans" class="mb-10">
      <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
         <lucide-icon name="folder-open" class="h-6 w-6 text-blue-500"></lucide-icon>
         Separate Plans & Policies
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (policy of activePolicies(); track policy.policyNumber) {
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div class="p-6 flex-1">
              <div class="flex items-center justify-between mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {{ policy.status }}
                </span>
                <span class="text-sm font-medium text-slate-400">#{{ policy.id }}</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {{ policy.planName || 'Standard Package' }}
              </h3>
              
              <div class="mt-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><lucide-icon name="shield-check" class="h-4 w-4"></lucide-icon> Coverage limit</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ policy.coverageAmount | currency }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><lucide-icon name="dollar-sign" class="h-4 w-4"></lucide-icon> Premium</span>
                  <span class="font-bold text-slate-800 dark:text-slate-100">{{ policy.premium | currency }}/mo</span>
                </div>
              </div>
              <div class="mt-6">
                <a routerLink="/customer/claim" [queryParams]="{ policyId: policy.id }" class="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg text-sm font-bold transition-colors">
                  Raise Claim
                </a>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">
             <p class="text-slate-500 italic">No active policies found. Get a quote to explore plans!</p>
          </div>
        }

        <!-- Pending or Rejected Summaries -->
        @for (policy of pendingPolicies(); track policy.policyNumber) {
          <div class="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800 p-6 opacity-90">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase">Pending Review</span>
            </div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100">{{ policy.planName }}</h3>
            <p class="text-xs text-yellow-700 dark:text-yellow-600 mt-2">Agents are verifying your documents.</p>
          </div>
        }
      </div>
    </section>

    <!-- Claim Activity Section -->
    <section id="claim-activity">
      <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
         <lucide-icon name="activity" class="h-6 w-6 text-emerald-500"></lucide-icon>
         Claim Activity
      </h2>

      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Claim ID</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (claim of claims(); track claim.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">#{{ claim.id }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ claim.reason }}</td>
                    <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ claim.claimAmount | currency }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{{ claim.createdAt | date:'mediumDate' }}</td>
                    <td class="px-6 py-4 text-right">
                       <span 
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800': claim.status === 'PendingApproval',
                          'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800': claim.status === 'Approved',
                          'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800': claim.status === 'Rejected'
                        }"
                        class="px-2.5 py-1 rounded-md text-xs font-bold uppercase"
                       >
                        {{ claim.status === 'PendingApproval' ? 'Pending' : claim.status }}
                       </span>
                    </td>
                  </tr>
                } @empty {
                   <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-slate-400 italic text-sm">No claims submitted yet.</td>
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

  activePolicies = computed(() => this.policies().filter(p => p.status === 'Active' || p.status === 'Inactive'));
  pendingPolicies = computed(() => this.policies().filter(p => p.status === 'Pending'));
  rejectedPolicies = computed(() => this.policies().filter(p => p.status === 'Rejected'));

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
    }
  }

  updateChart() {
    if (this.donutChartInstance) {
      const active = this.activePolicies();
      let totalCoverage = 0;
      active.forEach(p => totalCoverage += (p.coverageAmount || 0));

      const allClaims = this.claims();
      let totalClaimed = 0;
      allClaims.forEach(c => {
        if (c.status === 'Approved') totalClaimed += (c.claimAmount || 0);
      });

      if (totalCoverage === 0) {
        this.donutChartInstance.data.datasets[0].data = [0, 100];
      } else {
        const remaining = Math.max(0, totalCoverage - totalClaimed);
        this.donutChartInstance.data.datasets[0].data = [totalClaimed, remaining];
      }
      this.donutChartInstance.update();
    }
  }
}
