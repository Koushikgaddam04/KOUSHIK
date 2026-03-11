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
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Customers</p>
            <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalCustomers }}</p>
          </div>
          <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <lucide-icon name="users" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Active Policies Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Policies</p>
            <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalActivePolicies }}</p>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Total Revenue Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Revenue</p>
            <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalRevenue | currency }}</p>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <lucide-icon name="dollar-sign" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Total Payouts Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Claim Payouts</p>
            <p class="text-3xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalPayouts | currency }}</p>
          </div>
          <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <lucide-icon name="wallet" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

    </div>

    <!-- Charts & Analytics Section -->
    <div id="analytics" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      <!-- Policy vs Customer Bar Chart -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Customer vs Policy Adoption</h3>
          <lucide-icon name="bar-chart-2" class="h-5 w-5 text-slate-400"></lucide-icon>
        </div>
        <div class="flex-1 relative min-h-[300px]">
          <canvas #customerPolicyChart></canvas>
        </div>
      </div>

      <!-- Agent Payouts Donut Chart -->
      <div id="payouts" class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Payouts to Individual Agents</h3>
          <lucide-icon name="pie-chart" class="h-5 w-5 text-slate-400"></lucide-icon>
        </div>
        <div class="flex-1 relative min-h-[300px] flex items-center justify-center">
          <div class="relative w-full h-[280px]">
            <canvas #agentPayoutsChart></canvas>
          </div>
        </div>
      </div>

    </div>

    <!-- Additional Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Pending Claims Card -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
        <div class="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mb-4">
          <lucide-icon name="file-warning" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats().pendingClaimsCount }}</p>
        <p class="text-sm text-slate-500 font-medium">Pending Claims Processing</p>
      </div>

      <!-- Unpaid Commissions Card -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
        <div class="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mb-4">
          <lucide-icon name="banknote" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-3xl font-black text-slate-800 dark:text-white mb-1">{{ stats().unpaidCommissions | currency }}</p>
        <p class="text-sm text-slate-500 font-medium">Unpaid Commissions Pool</p>
      </div>

      <div 
        routerLink="/admin/logs"
        class="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-700/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
      >
        <div class="p-4 bg-blue-200 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 rounded-full mb-4 group-hover:scale-110 transition-transform">
          <lucide-icon name="list-checks" class="h-6 w-6"></lucide-icon>
        </div>
        <p class="text-3xl font-black text-blue-800 dark:text-blue-400 mb-1">{{ stats().totalActionLogs }}</p>
        <p class="text-sm text-blue-700 dark:text-blue-500 font-medium">System Action Logs</p>
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
