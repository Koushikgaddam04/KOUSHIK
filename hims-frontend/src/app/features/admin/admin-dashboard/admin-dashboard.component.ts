import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminSummary } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Stats..."></app-loading-spinner>
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Overview</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Key metrics and summary for HIMS operations.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pt-4">
      
      <!-- Revenue Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-emerald-500"></div>
        <div class="p-3 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg mr-4">
          <lucide-icon name="dollar-sign" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalRevenue | currency }}</p>
        </div>
      </div>

      <!-- Active Policies Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-blue-500"></div>
        <div class="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg mr-4">
          <lucide-icon name="shield-alert" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Active Policies</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalActivePolicies }}</p>
        </div>
      </div>

      <!-- Pending Claims Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
        <div class="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg mr-4">
          <lucide-icon name="file-warning" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Claims</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().pendingClaimsCount }}</p>
        </div>
      </div>

      <!-- Total Payouts Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-red-500"></div>
        <div class="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mr-4">
          <lucide-icon name="wallet" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Payouts</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().totalPayouts | currency }}</p>
        </div>
      </div>

      <!-- Unpaid Commissions Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-purple-500"></div>
        <div class="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg mr-4">
          <lucide-icon name="banknote" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Unpaid Commissions</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().unpaidCommissions | currency }}</p>
        </div>
      </div>

      <!-- Documents to Verify Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div class="absolute right-0 top-0 h-full w-2 bg-yellow-500"></div>
        <div class="p-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg mr-4">
          <lucide-icon name="file-check" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Documents to Verify</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats().documentsToVerify }}</p>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

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
      documentsToVerify: 0
    };

    return {
      totalRevenue: s.totalRevenue ?? s.TotalRevenue ?? 0,
      totalActivePolicies: s.totalActivePolicies ?? s.TotalActivePolicies ?? 0,
      pendingClaimsCount: s.pendingClaimsCount ?? s.PendingClaimsCount ?? 0,
      totalPayouts: s.totalPayouts ?? s.TotalPayouts ?? 0,
      unpaidCommissions: s.unpaidCommissions ?? s.UnpaidCommissions ?? 0,
      documentsToVerify: s.documentsToVerify ?? s.DocumentsToVerify ?? 0
    };
  });

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.isLoading.set(true);
    this.adminService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load dashboard summary data.');
        this.isLoading.set(false);
      }
    });
  }
}
