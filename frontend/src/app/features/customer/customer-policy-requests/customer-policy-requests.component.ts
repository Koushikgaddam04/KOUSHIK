import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-customer-policy-requests',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
    template: `
    <app-loading-spinner [show]="isLoading()" message="Loading requests..."></app-loading-spinner>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Policy Requests Tracking</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Track the status of your newly requested and rejected policies.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Pending Policies -->
        @for (policy of pendingPolicies(); track policy.id) {
          <div class="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800 p-6 opacity-90">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase">Pending Review</span>
            </div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100">{{ policy.planName || 'Standard Package' }}</h3>
            <p class="text-xs text-yellow-700 dark:text-yellow-600 mt-2">Agents are verifying your documents.</p>
          </div>
        }

        <!-- Rejected Policies -->
        @for (policy of rejectedPolicies(); track policy.id) {
            <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-red-800 dark:text-red-400">{{ policy.planName || 'Standard Package' }}</h3>
                <span class="text-xs font-bold text-red-600 dark:text-red-500 uppercase">Rejected</span>
                </div>
                <p class="text-xs text-red-700 dark:text-red-300">
                Your request for this policy has been rejected after review. Your payment will be refunded to your original payment method within 3-5 business days. 
                </p>
            </div>
        }

        @if (pendingPolicies().length === 0 && rejectedPolicies().length === 0 && !isLoading()) {
            <div class="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">
                <p class="text-slate-500 italic">No pending or rejected requests found.</p>
            </div>
        }
    </div>
  `
})
export class CustomerPolicyRequestsComponent implements OnInit {
    private customerService = inject(CustomerService);
    private toastr = inject(ToastrService);

    policies = signal<any[]>([]);
    isLoading = signal(false);

    pendingPolicies = computed(() => this.policies().filter(p => p.status === 'Pending'));
    rejectedPolicies = computed(() => this.policies().filter(p => p.status === 'Rejected'));

    ngOnInit() {
        this.isLoading.set(true);
        this.customerService.getMyPolicies().subscribe({
            next: (data) => {
                this.policies.set(data || []);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Failed to load requests.');
                this.isLoading.set(false);
            }
        });
    }
}
