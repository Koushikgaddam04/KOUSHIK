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

    <div class="max-w-7xl mx-auto">
      <div class="mb-12">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Settlement Audit Log</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
          Historical overview of all adjudication cycles and financial disbursements.
        </p>
      </div>

      <!-- Claim Activity Section -->
      <div class="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-blue-500/5 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div class="overflow-x-auto">
          <table class="min-w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence ID</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Class</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Rationale</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disbursement</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                  <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              @for (claim of claims(); track claim.id) {
                  <tr class="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-300">
                    <td class="px-8 py-6">
                      <div class="flex items-center gap-3">
                        <div class="p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                          <lucide-icon name="hash" class="h-3 w-3 text-slate-400"></lucide-icon>
                        </div>
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ claim.id }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-6">
                      <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800 uppercase tracking-widest">
                        {{ claim.planName || 'Standard' }}
                      </span>
                    </td>
                    <td class="px-8 py-6">
                      <p class="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-xs truncate group-hover:text-clip group-hover:whitespace-normal transition-all">{{ claim.reason }}</p>
                    </td>
                    <td class="px-8 py-6">
                      <span class="text-sm font-black text-slate-900 dark:text-white leading-none">{{ claim.claimAmount | currency }}</span>
                    </td>
                    <td class="px-8 py-6">
                      <div class="flex flex-col">
                        <span class="text-xs font-black text-slate-900 dark:text-white">{{ claim.createdAt | date:'mediumDate' }}</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ claim.createdAt | date:'shortTime' }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                        <span 
                          [ngClass]="{
                              'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800': claim.status === 'PendingApproval',
                              'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800': claim.status === 'Approved',
                              'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800': claim.status === 'Rejected'
                          }"
                          class="inline-flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm"
                        >
                          {{ claim.status === 'PendingApproval' ? 'Pending' : claim.status }}
                        </span>
                    </td>
                  </tr>
              } @empty {
                  <tr>
                    <td colspan="6" class="px-8 py-20 text-center">
                       <div class="flex flex-col items-center gap-4 opacity-40">
                         <lucide-icon name="database" class="h-12 w-12 text-slate-300"></lucide-icon>
                         <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Log Null</p>
                       </div>
                    </td>
                  </tr>
              }
              </tbody>
          </table>
          </div>
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
