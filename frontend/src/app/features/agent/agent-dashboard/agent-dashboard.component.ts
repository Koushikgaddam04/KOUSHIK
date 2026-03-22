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
    
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Agent Command Center</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Real-time oversight of customer acquisition and commission earnings.</p>
    </div>

    <!-- Agent Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pt-4">
      
      <!-- Customers Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-center relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Managed Customers</p>
            <p class="text-4xl font-black text-slate-900 dark:text-white">{{ stats().customers }}</p>
          </div>
          <div class="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-blue-100 dark:border-blue-800/50">
            <lucide-icon name="users" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Policies Sold Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-center relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Policies Sold</p>
            <p class="text-4xl font-black text-slate-900 dark:text-white">{{ stats().policiesSold }}</p>
          </div>
          <div class="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
            <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Commissions Card -->
      <div id="commissions" class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-center relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Earned Commission</p>
            <p class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">{{ stats().commissions | currency }}</p>
          </div>
          <div class="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-purple-100 dark:border-purple-800/50">
            <lucide-icon name="banknote" class="h-6 w-6"></lucide-icon>
          </div>
        </div>
      </div>

    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
      
      <!-- Performance Line Chart -->
      <div class="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white">Revenue Trajectory</h3>
            <p class="text-xs text-slate-500 font-medium">Monthly sales performance overview</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
             <lucide-icon name="trending-up" class="h-5 w-5 text-blue-600"></lucide-icon>
          </div>
        </div>
        <div class="flex-1 min-h-[300px] relative">
          <canvas #performanceChart></canvas>
        </div>
      </div>

      <!-- Task/Queue Shortcut -->
      <div class="lg:col-span-2 bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-500/30 flex flex-col justify-between overflow-hidden relative group">
        <div class="relative z-10 flex flex-col h-full">
          <div class="bg-white/10 p-4 rounded-2xl w-fit mb-6">
            <lucide-icon name="rocket" class="h-8 w-8 text-white"></lucide-icon>
          </div>
          
          <h3 class="text-2xl font-black mb-2 tracking-tight">Quarterly Goal Status</h3>
          <p class="text-indigo-100 text-sm font-medium mb-8 leading-relaxed">Impressive work! You've achieved <span class="text-white font-black">85%</span> of your current performance milestone.</p>
          
          <div class="mt-auto space-y-6">
            <div class="space-y-2">
               <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200">
                  <span>Progress</span>
                  <span>85% Completetion</span>
               </div>
               <div class="w-full bg-indigo-900/30 rounded-full h-4 p-1">
                 <div class="bg-white rounded-full h-full shadow-lg" style="width: 85%"></div>
               </div>
            </div>

            <button 
              routerLink="/agent/queue" 
              class="w-full py-4 bg-white text-indigo-600 rounded-2xl text-sm font-black hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group/btn"
            >
              Access Verification Queue
              <lucide-icon name="arrow-right" class="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform"></lucide-icon>
            </button>
          </div>
        </div>
        
        <!-- Decorative blobs -->
        <div class="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div class="absolute top-10 right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:-translate-y-8 transition-transform duration-700"></div>
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

          // Real uniquely assigned customers are those holding these policies/quotes
          // This now includes both active and pending customers assigned to the agent
          const uniqueCustomers = new Set(p.map((item: any) => item.userId)).size;

          // Total policies sold counts completed sales (Active or Paid)
          const policiesSold = p.filter((item: any) => 
            item.isActive === true || 
            item.isPaid === true || 
            item.status === 'Active'
          ).length;

          // Only count actual completed positive validations for the chart
          const approvedVerifications = h.filter((item: any) => 
            item.newValue?.includes('Approved') || 
            item.newValue?.includes('Active') || 
            item.actionDetails === 'PolicyVerified'
          );

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
