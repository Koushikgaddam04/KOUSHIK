import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, ShieldCheck, FileSearch, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner
      [show]="isLoading()"
      message="Loading your policies..."
    ></app-loading-spinner>

    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">My Dashboard</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your active policies and track claims.</p>
      </div>
      <div class="flex gap-3">
        <a
          routerLink="/customer/quote"
          class="inline-flex items-center justify-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none transition-colors"
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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Empty State -->
      @if (policies().length === 0) {
        <div
          class="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center"
        >
          <div
            class="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4"
          >
            <lucide-icon name="shield-check" class="h-8 w-8"></lucide-icon>
          </div>
          <h3 class="text-lg font-medium text-slate-900">No Active Policies</h3>
          <p class="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            You don't have any active insurance policies yet. Start by getting a quote!
          </p>
          <div class="mt-6">
            <a
              routerLink="/customer/quote"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get a Quote <lucide-icon name="arrow-right" class="ml-2 h-4 w-4"></lucide-icon>
            </a>
          </div>
        </div>
      }

      <!-- Policy Cards -->
      @for (policy of policies(); track policy) {
        <div
          class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
        >
          <div class="p-6 flex-1">
            <div class="flex items-center justify-between mb-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                [ngClass]="{
                  'bg-green-100 text-green-800': policy.status === 'Active',
                  'bg-yellow-100 text-yellow-800': policy.status === 'Pending',
                }"
              >
                {{ policy.status }}
              </span>
              <span class="text-sm font-medium text-slate-500">ID: #{{ policy.id }}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900">
              {{ policy.planName || 'Standard Package' }}
            </h3>

            <div class="mt-6 border-t border-slate-100 pt-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Coverage Amount</span>
                <span class="font-medium text-slate-900">{{
                  policy.coverageAmount || 50000 | currency
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Premium / month</span>
                <span class="font-medium text-slate-900">{{
                  policy.premium || 150 | currency
                }}</span>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-3 border-t border-slate-100">
            <a
              routerLink="/customer/claim"
              [queryParams]="{ policyId: policy.id }"
              class="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
            >
              Submit Claim for this policy
              <lucide-icon name="arrow-right" class="ml-1 h-4 w-4"></lucide-icon>
            </a>
          </div>
        </div>
      }
    </div>
  `,
})
export class CustomerDashboardComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastr = inject(ToastrService);

  policies = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.isLoading.set(true);
    this.customerService.getMyPolicies().subscribe({
      next: (res) => {
        this.policies.set(res || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load your policies.');
        this.isLoading.set(false);
      },
    });
  }
}
