import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, ShieldCheck, FileSearch, ArrowRight, FileText, User, UserCheck, Clock, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-angular';
import { forkJoin } from 'rxjs';

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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-12">
        
        <!-- Active Policies Section -->
        <section>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
             <lucide-icon name="shield-check" class="h-5 w-5 text-green-500"></lucide-icon>
             Active Policies
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (policy of activePolicies(); track policy.policyNumber) {
              <div
                class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div class="p-6 flex-1">
                  <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {{ policy.status }}
                    </span>
                    <span class="text-sm font-medium text-slate-400">ID: #{{ policy.id }}</span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {{ policy.planName || 'Standard Package' }}
                  </h3>

                  <div class="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-6 font-medium text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 flex items-center gap-1.5"><lucide-icon name="user-check" class="h-3.5 w-3.5"></lucide-icon> Assigned Agent</span>
                      <span class="text-slate-800 dark:text-slate-200">{{ policy.agentName }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 flex items-center gap-1.5"><lucide-icon name="user" class="h-3.5 w-3.5"></lucide-icon> Claims Officer</span>
                      <span class="text-slate-800 dark:text-slate-200">{{ policy.claimsOfficerName }}</span>
                    </div>
                  </div>

                  <div class="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500 dark:text-slate-400">Coverage</span>
                      <span class="font-medium text-slate-900 dark:text-white">{{ policy.coverageAmount | currency }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500 dark:text-slate-400">Premium</span>
                      <span class="font-medium text-slate-800 dark:text-slate-100">{{ policy.premium | currency }}/mo</span>
                    </div>
                  </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    routerLink="/customer/claim"
                    [queryParams]="{ policyId: policy.id }"
                    class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center justify-center"
                  >
                    Submit Claim
                    <lucide-icon name="arrow-right" class="ml-1 h-4 w-4"></lucide-icon>
                  </a>
                </div>
              </div>
            } @empty {
              <div class="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">
                 <p class="text-slate-500 italic">No active policies found.</p>
              </div>
            }
          </div>
        </section>

        <!-- Pending Policies Section -->
        <section>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
             <lucide-icon name="clock" class="h-5 w-5 text-yellow-500"></lucide-icon>
             Pending Verification
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (policy of pendingPolicies(); track policy.policyNumber) {
              <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {{ policy.status }}
                    </span>
                    <span class="text-[10px] text-slate-400">{{ policy.policyNumber }}</span>
                </div>
                <h3 class="font-bold text-slate-800 dark:text-slate-100">{{ policy.planName }}</h3>
                <p class="text-xs text-slate-500 mt-1">Our agents are currently reviewing your documents and coverage details.</p>
              </div>
            } @empty {
              <div class="col-span-full border border-slate-100 dark:border-slate-800 rounded-xl p-8 text-center">
                 <p class="text-slate-400 text-sm">No pending policy requests.</p>
              </div>
            }
          </div>
        </section>

        <!-- Rejected Policies Section -->
        @if (rejectedPolicies().length > 0) {
          <section>
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
               <lucide-icon name="alert-circle" class="h-5 w-5 text-red-500"></lucide-icon>
               Policy Rejections
            </h2>
            <div class="space-y-4">
              @for (policy of rejectedPolicies(); track policy.policyNumber) {
                <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-red-800 dark:text-red-400">{{ policy.planName }}</h3>
                    <span class="text-xs font-bold text-red-600 dark:text-red-500 uppercase">Rejected</span>
                  </div>
                  <p class="text-sm text-red-700 dark:text-red-300">
                    Your request for this policy has been rejected after review. 
                    <strong>Note:</strong> Your payment has been marked for refund and will be credited back to your account within 3-5 business days.
                  </p>
                </div>
              }
            </div>
          </section>
        }

        <!-- Claim Status Section -->
        <section>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
             <lucide-icon name="file-text" class="h-5 w-5 text-purple-500"></lucide-icon>
             Claim Tracking
          </h2>

          <!-- Claim Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
              <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <lucide-icon name="trending-up" class="h-4 w-4 text-slate-600 dark:text-slate-300"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Total</p>
                <p class="text-xl font-bold text-slate-900 dark:text-white">{{ claimStats().total }}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-yellow-200 dark:border-yellow-900/40 p-4 flex items-center gap-3">
              <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <lucide-icon name="clock" class="h-4 w-4 text-yellow-600 dark:text-yellow-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                <p class="text-xl font-bold text-yellow-600 dark:text-yellow-400">{{ claimStats().pending }}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-900/40 p-4 flex items-center gap-3">
              <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <lucide-icon name="check-circle" class="h-4 w-4 text-green-600 dark:text-green-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Approved</p>
                <p class="text-xl font-bold text-green-600 dark:text-green-400">{{ claimStats().approved }}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/40 p-4 flex items-center gap-3">
              <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <lucide-icon name="alert-circle" class="h-4 w-4 text-red-600 dark:text-red-400"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Rejected</p>
                <p class="text-xl font-bold text-red-600 dark:text-red-400">{{ claimStats().rejected }}</p>
              </div>
            </div>
          </div>

          <!-- Claims Table -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                  <thead class="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Claim ID</th>
                      <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Reason</th>
                      <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                      <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    @for (claim of claims(); track claim.id) {
                      <tr>
                        <td class="px-6 py-4 text-sm font-medium">#{{ claim.id }}</td>
                        <td class="px-6 py-4 text-xs text-slate-500">{{ claim.reason }}</td>
                        <td class="px-6 py-4 text-sm font-bold">{{ claim.claimAmount | currency }}</td>
                        <td class="px-6 py-4 text-xs text-slate-400">{{ claim.createdAt | date:'mediumDate' }}</td>
                        <td class="px-6 py-4 text-right">
                           <span 
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400': claim.status === 'PendingApproval',
                              'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400': claim.status === 'Approved',
                              'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400': claim.status === 'Rejected'
                            }"
                            class="px-2 py-0.5 rounded text-[10px] uppercase font-black"
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

      </div>

      <!-- Right Sidebar -->
      <div class="lg:col-span-1 space-y-8">
        <div class="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-lg font-bold mb-2">Need Assistance?</h3>
            <p class="text-blue-100 text-sm mb-4">Contact our support or your assigned agent directly for faster resolution.</p>
            <button class="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">Contact Support</button>
          </div>
          <lucide-icon name="shield-check" class="absolute -right-4 -bottom-4 h-24 w-24 text-blue-500/30"></lucide-icon>
        </div>
      </div>
    </div>
  `,
})
export class CustomerDashboardComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastr = inject(ToastrService);

  policies = signal<any[]>([]);
  claims = signal<any[]>([]);
  isLoading = signal(false);

  activePolicies = computed(() => this.policies().filter(p => p.status === 'Active' || p.status === 'Inactive'));
  pendingPolicies = computed(() => this.policies().filter(p => p.status === 'Pending'));
  rejectedPolicies = computed(() => this.policies().filter(p => p.status === 'Rejected'));

  // Claim statistics derived from the loaded claims — no extra API call
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
      },
      error: () => {
        this.toastr.error('Failed to load dashboard data.');
        this.isLoading.set(false);
      }
    });
  }
}
