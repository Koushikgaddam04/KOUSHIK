import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-customer-claims-tracking',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
    template: `
    <app-loading-spinner [show]="isLoading()" message="Loading claims history..."></app-loading-spinner>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Claims Tracking</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Status of your submitted claims and historical data.</p>
    </div>

    <!-- Claim Activity Section -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Claim ID</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Name</th>
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
                <td class="px-6 py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">{{ claim.planName || 'Standard Package' }}</td>
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
                <td colspan="6" class="px-6 py-8 text-center text-slate-400 italic text-sm">No claims submitted yet.</td>
                </tr>
            }
            </tbody>
        </table>
        </div>
    </div>
  `
})
export class CustomerClaimsTrackingComponent implements OnInit {
    private customerService = inject(CustomerService);
    private toastr = inject(ToastrService);

    claims = signal<any[]>([]);
    isLoading = signal(false);

    ngOnInit() {
        this.isLoading.set(true);
        this.customerService.getMyClaims().subscribe({
            next: (data) => {
                this.claims.set(data || []);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Failed to load claims tracking.');
                this.isLoading.set(false);
            }
        });
    }
}
