import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Clock, CheckCircle2, XCircle, FolderOpen } from 'lucide-angular';

@Component({
    selector: 'app-customer-policy-requests',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
    template: `
    <app-loading-spinner [show]="isLoading()" message="Loading requests..."></app-loading-spinner>

    <div class="max-w-7xl mx-auto">
      <div class="mb-12 text-center md:text-left">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Policy Requests</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
          Track the status of your new insurance policy applications.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Pending Policies -->
          @for (policy of pendingPolicies(); track policy.id) {
            <div class="group relative bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-amber-500/5 dark:shadow-none border border-amber-100 dark:border-amber-900/40 p-10 flex flex-col hover:shadow-amber-500/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div class="flex items-center justify-between mb-10 relative z-10">
                  <div class="flex items-center gap-4">
                     <div class="p-3.5 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm">
                       <lucide-icon name="clock" class="h-6 w-6"></lucide-icon>
                     </div>
                     <div>
                        <span class="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Pending Review</span>
                        <h3 class="font-black text-slate-900 dark:text-white text-xl leading-tight">{{ policy.planName || 'Standard Package' }}</h3>
                     </div>
                  </div>
              </div>
              
              <div class="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100/50 dark:border-amber-800/30 mb-8 relative z-10">
                 <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-bold italic">We are currently verifying your uploaded documents.</p>
              </div>

              <div class="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID: #{{ policy.id }}</span>
                <div class="flex gap-1">
                   <div class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                   <div class="w-1.5 h-1.5 bg-amber-400/40 rounded-full"></div>
                   <div class="w-1.5 h-1.5 bg-amber-400/20 rounded-full"></div>
                </div>
              </div>
            </div>
          }

          <!-- Active/Payment Pending Policies -->
          @for (policy of activePolicies(); track policy.id) {
            <div class="group relative bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-emerald-500/5 dark:shadow-none border border-emerald-100 dark:border-emerald-900/40 p-10 flex flex-col hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div class="flex items-center justify-between mb-10 relative z-10">
                  <div class="flex items-center gap-4">
                     <div class="p-3.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-500 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                       <lucide-icon name="check-circle-2" class="h-6 w-6"></lucide-icon>
                     </div>
                     <div>
                        <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{{ policy.status === 'Active' ? 'Activated' : 'Payment Needed' }}</span>
                        <h3 class="font-black text-slate-900 dark:text-white text-xl leading-tight">{{ policy.planName || 'Standard Package' }}</h3>
                     </div>
                  </div>
              </div>

              <div class="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100/50 dark:border-emerald-800/30 mb-8 relative z-10">
                <p class="text-xs text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">
                   {{ policy.status === 'Active' ? 'Your policy is now active and ready for use.' : 'Documents verified. Please make the final payment to activate.' }}
                </p>
              </div>

              <div class="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy ID: #{{ policy.id }}</span>
                <lucide-icon name="shield-check" class="h-4 w-4 text-emerald-500"></lucide-icon>
              </div>
            </div>
          }

          <!-- Rejected Policies -->
          @for (policy of rejectedPolicies(); track policy.id) {
              <div class="group relative bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-rose-500/5 dark:shadow-none border border-rose-100 dark:border-rose-900/40 p-10 flex flex-col hover:shadow-rose-500/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div class="flex items-center justify-between mb-10 relative z-10">
                    <div class="flex items-center gap-4">
                       <div class="p-3.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-500 rounded-2xl border border-rose-100 dark:border-rose-800 shadow-sm">
                         <lucide-icon name="x-circle" class="h-6 w-6"></lucide-icon>
                       </div>
                       <div>
                          <span class="text-[10px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest">Rejected</span>
                          <h3 class="font-black text-slate-900 dark:text-white text-xl leading-tight">{{ policy.planName || 'Standard Package' }}</h3>
                       </div>
                    </div>
                </div>

                <div class="bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl p-6 border border-rose-100/50 dark:border-rose-800/30 mb-8 relative z-10">
                  <p class="text-xs text-rose-700 dark:text-rose-400 font-bold leading-relaxed">
                     Policy rejected. Please check your document accuracy and try again.
                  </p>
                </div>

                <div class="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID: #{{ policy.id }}</span>
                  <lucide-icon name="alert-circle" class="h-4 w-4 text-rose-500"></lucide-icon>
                </div>
              </div>
          }

          @if (activePolicies().length === 0 && pendingPolicies().length === 0 && rejectedPolicies().length === 0 && !isLoading()) {
              <div class="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-100/50 dark:shadow-none">
                <div class="relative inline-block mb-10">
                   <div class="p-8 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200 dark:text-slate-700">
                      <lucide-icon name="folder-open" class="h-20 w-20"></lucide-icon>
                   </div>
                </div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Registry Clean</h3>
                <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium italic">No active or historical authentication cycles discovered.</p>
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

    activePolicies = computed(() => this.policies().filter(p => p.status === 'Active' || p.status === 'Payment Pending'));
    pendingPolicies = computed(() => this.policies().filter(p => p.status === 'Pending Review'));
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
