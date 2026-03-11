import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminSummary } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';
import { Chart, registerables } from 'chart.js';

import { RouterModule } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule, RouterModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Stats..."></app-loading-spinner>
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Overview</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Key metrics and summary for HIMS operations.</p>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 pt-4">
      
      <!-- Total Customers Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Customers</p>
            <p class="text-4xl font-extrabold text-slate-800 dark:text-white">{{ stats().totalCustomers }}</p>
          </div>
          <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
            <lucide-icon name="users" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Active Policies Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Active Policies</p>
            <p class="text-4xl font-extrabold text-slate-800 dark:text-white">{{ stats().totalActivePolicies }}</p>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm border border-blue-100 dark:border-blue-800/50">
            <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Total Revenue Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Revenue</p>
            <p class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">{{ stats().totalRevenue | currency }}</p>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
            <lucide-icon name="dollar-sign" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Total Payouts Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Claim Payouts</p>
            <p class="text-3xl font-extrabold text-slate-800 dark:text-white">{{ stats().totalPayouts | currency }}</p>
          </div>
          <div class="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm border border-rose-100 dark:border-rose-800/50">
            <lucide-icon name="wallet" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

    </div>

    <!-- Charts & Analytics Section -->
    <div id="analytics" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      <!-- Policy vs Customer Bar Chart -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Customer vs Policy Adoption</h3>
          <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <lucide-icon name="bar-chart-2" class="h-4 w-4 text-slate-500"></lucide-icon>
          </div>
        </div>
        <div class="flex-1 relative min-h-[300px]">
          <canvas #customerPolicyChart></canvas>
        </div>
      </div>

      <!-- Agent Payouts Donut Chart -->
      <div id="payouts" class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Payouts to Individual Agents</h3>
          <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <lucide-icon name="pie-chart" class="h-4 w-4 text-slate-500"></lucide-icon>
          </div>
        </div>
        <div class="flex-1 relative min-h-[300px] flex items-center justify-center">
          <div class="relative w-full h-[280px]">
            <canvas #agentPayoutsChart></canvas>
          </div>
        </div>
      </div>

    </div>

    <!-- Additional Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Pending Claims Card -->
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200/60 dark:border-orange-800/50 p-6 flex flex-col items-center justify-center text-center shadow-sm">
        <div class="p-4 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-2xl shadow-sm mb-4">
          <lucide-icon name="file-warning" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-2">{{ stats().pendingClaimsCount }}</p>
        <p class="text-[10px] uppercase tracking-widest text-orange-700/80 dark:text-orange-400/80 font-bold">Pending Claims</p>
      </div>

      <!-- Unpaid Commissions Card -->
      <div class="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/10 dark:to-fuchsia-900/10 rounded-2xl border border-purple-200/60 dark:border-fuchsia-800/50 p-6 flex flex-col items-center justify-center text-center shadow-sm">
        <div class="p-4 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm mb-4">
          <lucide-icon name="banknote" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 mb-2">{{ stats().unpaidCommissions | currency }}</p>
        <p class="text-[10px] uppercase tracking-widest text-purple-700/80 dark:text-purple-400/80 font-bold">Unpaid Commissions</p>
      </div>

      <div 
        routerLink="/admin/verify-docs"
        class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl border border-emerald-200/60 dark:border-teal-800/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm group"
      >
        <div class="p-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
          <lucide-icon name="file-check" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">{{ stats().documentsToVerify }}</p>
        <p class="text-[10px] uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 font-bold flex items-center gap-1">Verify Documents <lucide-icon name="arrow-right" class="h-3 w-3 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300"></lucide-icon></p>
      </div>

      <div 
        routerLink="/admin/logs"
        class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-blue-200/60 dark:border-cyan-800/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-sm group"
      >
        <div class="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
          <lucide-icon name="list-checks" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">{{ stats().totalActionLogs }}</p>
        <p class="text-[10px] uppercase tracking-widest text-blue-700/80 dark:text-blue-400/80 font-bold flex items-center gap-1">System Action Logs <lucide-icon name="arrow-right" class="h-3 w-3 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300"></lucide-icon></p>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  @ViewChild('customerPolicyChart') customerPolicyChartRef!: ElementRef;
  @ViewChild('agentPayoutsChart') agentPayoutsChartRef!: ElementRef;

  private barChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;

  summary = signal<any>(null);
  isLoading = signal(false);

  // Compute stats with case-insensitive fallback to handle different backend serialization setups
  stats = computed(() => {
    const s = this.summary();
    if (!s) return {
      totalRevenue: 0,
      totalActivePolicies: 0,
      pendingClaimsCount: 0,
      totalPayouts: 0,
      unpaidCommissions: 0,
      documentsToVerify: 0,
      totalActionLogs: 0,
      totalCustomers: 0,
      agentPayouts: {}
    };

    const active = s.totalActivePolicies ?? s.TotalActivePolicies ?? 0;

    return {
      totalRevenue: s.totalRevenue ?? s.TotalRevenue ?? 0,
      totalActivePolicies: active,
      pendingClaimsCount: s.pendingClaimsCount ?? s.PendingClaimsCount ?? 0,
      totalPayouts: s.totalPayouts ?? s.TotalPayouts ?? 0,
      unpaidCommissions: s.unpaidCommissions ?? s.UnpaidCommissions ?? 0,
      documentsToVerify: s.documentsToVerify ?? s.DocumentsToVerify ?? 0,
      totalActionLogs: s.totalActionLogs ?? s.TotalActionLogs ?? 0,
      totalCustomers: s.totalCustomers ?? s.TotalCustomers ?? active,
      agentPayouts: s.agentPayouts ?? s.AgentPayouts ?? {}
    };
  });

  realAgents: any[] = [];

  ngOnInit() {
    this.loadSummary();
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  loadSummary() {
    this.isLoading.set(true);
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        summary: this.adminService.getSummary(),
        agents: this.adminService.getAgents()
      }).subscribe({
        next: ({ summary, agents }) => {
          this.summary.set(summary);
          this.realAgents = agents || [];
          this.isLoading.set(false);
          this.updateCharts();
        },
        error: (err) => {
          this.toastr.error('Failed to load dashboard summary data.');
          this.isLoading.set(false);
          this.updateCharts();
        }
      });
    });
  }

  initCharts() {
    if (this.customerPolicyChartRef) {
      const ctx = this.customerPolicyChartRef.nativeElement.getContext('2d');
      this.barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Current Period'],
          datasets: [
            {
              label: 'Customers Acquired',
              data: [0],
              backgroundColor: '#3b82f6', // blue-500
              borderRadius: 4
            },
            {
              label: 'Policies Sold',
              data: [0],
              backgroundColor: '#10b981', // emerald-500
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    if (this.agentPayoutsChartRef) {
      const ctx2 = this.agentPayoutsChartRef.nativeElement.getContext('2d');
      this.donutChartInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Loading Agents...'],
          datasets: [{
            data: [0],
            backgroundColor: [
              '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'
            ],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'right' }
          }
        },
        plugins: [{
          id: 'centerText',
          beforeDraw: (chart: any) => {
            const width = chart.width;
            const height = chart.height;
            const ctx = chart.ctx;

            ctx.restore();
            const fontSize = (height / 150).toFixed(2);
            ctx.font = `bold ${fontSize}em sans-serif`;
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#475569"; // slate-600

            // The data total
            const total = chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            // Assuming this represents total Agent commissions, we format it as currency
            const text = "$" + Number(total).toLocaleString();

            const textX = Math.round((width - ctx.measureText(text).width) / 2);
            const textY = height / 2;

            ctx.fillText(text, textX, textY);
            ctx.save();
          }
        }]
      });
    }
  }

  updateCharts() {
    if (this.barChartInstance) {
      this.barChartInstance.data.datasets[0].data = [this.stats().totalCustomers];
      this.barChartInstance.data.datasets[1].data = [this.stats().totalActivePolicies];
      this.barChartInstance.update();
    }

    if (this.donutChartInstance) {
      const agentPayoutsMap = this.stats().agentPayouts;

      if (this.realAgents.length > 0) {
        const agents = this.realAgents.slice(0, 5);
        this.donutChartInstance.data.labels = agents.map(a => a.name || a.fullName || a.username || 'System Agent');

        // Extract accurate payout per agent from the dictionary payload
        this.donutChartInstance.data.datasets[0].data = agents.map(a => {
          return agentPayoutsMap[a.id] || 0;
        });
      } else {
        this.donutChartInstance.data.labels = ['No Agents Available'];
        this.donutChartInstance.data.datasets[0].data = [0];
      }
      this.donutChartInstance.update();
    }
  }
}
