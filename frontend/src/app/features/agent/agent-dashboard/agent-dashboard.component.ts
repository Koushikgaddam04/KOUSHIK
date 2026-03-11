import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule, RouterModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Dashboard..."></app-loading-spinner>
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Agent Dashboard</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Your performance, commissions, and customer analytics.</p>
    </div>

    <!-- Agent Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4">
      
      <!-- Customers Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-blue-500"></div>
        <div class="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg mr-4">
          <lucide-icon name="users" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Customers</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().customers }}</p>
        </div>
      </div>

      <!-- Policies Sold Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-emerald-500"></div>
        <div class="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg mr-4">
          <lucide-icon name="shield-check" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Policies Sold</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().policiesSold }}</p>
        </div>
      </div>

      <!-- Commissions Card -->
      <div id="commissions" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-purple-500"></div>
        <div class="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg mr-4">
          <lucide-icon name="banknote" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Earned Commissions</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().commissions | currency }}</p>
        </div>
      </div>

    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      
      <!-- Performance Line Chart -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Sales Performance (Last 6 Months)</h3>
        <div class="flex-1 min-h-[300px] relative">
          <canvas #performanceChart></canvas>
        </div>
      </div>

      <!-- Task/Queue Shortcut -->
      <div class="bg-blue-600 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between overflow-hidden relative">
        <div class="relative z-10">
          <lucide-icon name="trending-up" class="h-10 w-10 mb-4 text-blue-200"></lucide-icon>
          <h3 class="text-xl font-bold mb-2">Agent Target Progress</h3>
          <p class="text-blue-100 text-sm mb-6">You're doing great! You are 85% towards your quarterly goal.</p>
          
          <div class="w-full bg-blue-800/50 rounded-full h-3 mb-6">
            <div class="bg-white rounded-full h-3" style="width: 85%"></div>
          </div>

          <a routerLink="/agent/queue" class="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
            Go to Verification Queue
          </a>
        </div>
        <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

    </div>
  `
})
export class AgentDashboardComponent implements OnInit, AfterViewInit {
  private agentService = inject(AgentService);
  private toastr = inject(ToastrService);

  @ViewChild('performanceChart') performanceChartRef!: ElementRef;
  private chartInstance: Chart | null = null;

  isLoading = signal(false);
  stats = signal({ customers: 0, policiesSold: 0, commissions: 0 });

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Generate a chart instance once view is ready
    this.initChart();
  }

  loadData() {
    this.isLoading.set(true);
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        history: this.agentService.getHistory(),
        activePolicies: this.agentService.getMyActivePolicies(),
        commissions: this.agentService.getMyCommissions()
      }).subscribe({
        next: ({ history, activePolicies, commissions }) => {
          const h = history || [];
          const p = activePolicies || [];
          const c = commissions || [];

          // Real uniquely assigned customers are those holding these active policies
          const uniqueCustomers = new Set(p.map((item: any) => item.userId)).size;
          const policiesSold = p.length;

          // Only count actual completed positive validations
          const approvedVerifications = h.filter((item: any) => item.newValue === 'Approved' || item.actionDetails === 'PolicyVerified');

          let realCommissions = 0;
          c.forEach((log: any) => realCommissions += log.earnedAmount || 0);

          this.stats.set({
            customers: uniqueCustomers,
            policiesSold: policiesSold,
            commissions: realCommissions
          });

          this.isLoading.set(false);
          this.updateChartData(approvedVerifications);
        },
        error: () => {
          this.toastr.error('Failed to load agent stats');
          this.isLoading.set(false);
          this.stats.set({ customers: 0, policiesSold: 0, commissions: 0 });
          this.updateChartData([]);
        }
      });
    });
  }

  initChart() {
    if (this.performanceChartRef) {
      const ctx = this.performanceChartRef.nativeElement.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Loading...'],
          datasets: [{
            label: 'Policies Sold',
            data: [0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, suggestedMax: 5 }
          }
        }
      });
    }
  }

  updateChartData(history: any[]) {
    if (this.chartInstance) {
      const months = [];
      const data = [0, 0, 0, 0, 0, 0];
      const now = new Date();

      // Calculate last 6 months physically
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toLocaleString('default', { month: 'short' }));
      }

      // Bucket existing array elements explicitly by their creation date
      history.forEach(h => {
        const d = new Date(h.date || h.createdAt || new Date());
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (diffMonths >= 0 && diffMonths < 6) {
          data[5 - diffMonths]++;
        }
      });

      this.chartInstance.data.labels = months;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.options!.scales!['y']!.suggestedMax = Math.max(...data) + 2;
      this.chartInstance.update();
    }
  }
}
