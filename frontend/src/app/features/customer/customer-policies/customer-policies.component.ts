import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading policies..."></app-loading-spinner>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">My Policies</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">View and manage your active insurance plans.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (policy of activePolicies(); track policy.id) {
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="p-6 flex-1">
            <div class="flex items-center justify-between mb-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {{ policy.status }}
              </span>
              <span class="text-sm font-medium text-slate-400">#{{ policy.id }}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {{ policy.planName || 'Standard Package' }}
            </h3>
            
            <div class="mt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><lucide-icon name="shield-check" class="h-4 w-4"></lucide-icon> Coverage limit</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ policy.coverageAmount | currency }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><lucide-icon name="dollar-sign" class="h-4 w-4"></lucide-icon> Premium</span>
                <span class="font-bold text-slate-800 dark:text-slate-100">{{ policy.premium | currency }}/mo</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><lucide-icon name="user" class="h-4 w-4"></lucide-icon> Assigned Agent</span>
                <span class="font-bold text-slate-800 dark:text-slate-100">{{ policy.agentName || 'Not Assigned' }}</span>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <a routerLink="/customer/claim" [queryParams]="{ policyId: policy.id }" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center">
               Raise Claim <lucide-icon name="arrow-right" class="ml-1 h-3.5 w-3.5"></lucide-icon>
            </a>
          </div>
        </div>
      } @empty {
        <div class="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">
           <p class="text-slate-500 italic">No active policies found. Get a quote to explore plans!</p>
           <a routerLink="/customer/quote" class="mt-4 inline-block text-blue-600 hover:underline">Get New Quote</a>
        </div>
      }
    </div>
  `
})
export class CustomerPoliciesComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastr = inject(ToastrService);

  policies = signal<any[]>([]);
  isLoading = signal(false);

  activePolicies = computed(() => this.policies().filter(p => p.status === 'Active' || p.status === 'Inactive'));

  ngOnInit() {
    this.isLoading.set(true);
    this.customerService.getMyPolicies().subscribe({
      next: (data) => {
        this.policies.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load policies.');
        this.isLoading.set(false);
      }
    });
  }
}
