import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminSummary } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, DollarSign, ShieldAlert, FileWarning } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Stats..."></app-loading-spinner>
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">Admin Overview</h1>
      <p class="text-slate-500 mt-1">Key metrics and summary for HIMS operations.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4">
      
      <!-- Revenue Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center relative overflow-hidden group hover:shadow-md transition-shadow">
        <div class="absolute right-0 top-0 h-full w-2 bg-emerald-500"></div>
        <div class="p-3 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
          <lucide-icon name="dollar-sign" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500">Total Revenue</p>
          <p class="text-2xl font-bold text-slate-800">{{ summary()?.totalRevenue | currency }}</p>
        </div>
      </div>

      <!-- Active Policies Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-shadow">
        <div class="absolute right-0 top-0 h-full w-2 bg-blue-500"></div>
        <div class="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
          <lucide-icon name="shield-alert" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500">Active Policies</p>
          <p class="text-2xl font-bold text-slate-800">{{ summary()?.totalActivePolicies || 0 }}</p>
        </div>
      </div>

      <!-- Pending Claims Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center relative overflow-hidden hover:shadow-md transition-shadow">
        <div class="absolute right-0 top-0 h-full w-2 bg-orange-500"></div>
        <div class="p-3 bg-orange-100 text-orange-600 rounded-lg mr-4">
          <lucide-icon name="file-warning" class="h-8 w-8"></lucide-icon>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500">Pending Claims</p>
          <p class="text-2xl font-bold text-slate-800">{{ summary()?.pendingClaimsCount || 0 }}</p>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  summary = signal<AdminSummary | null>(null);
  isLoading = signal(false);

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
