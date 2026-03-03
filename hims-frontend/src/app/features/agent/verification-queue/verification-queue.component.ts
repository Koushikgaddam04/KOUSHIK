import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, CheckCircle, Search, ClipboardList } from 'lucide-angular';

@Component({
  selector: 'app-verification-queue',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Processing Policy..."></app-loading-spinner>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Verification Queue</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Review and verify pending customer policies.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div class="relative w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search queue..."
            class="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Policy ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Customer Info
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Plan Details
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Submitted
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @if (queue().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  <div class="flex flex-col items-center">
                    <lucide-icon
                      name="clipboard-list"
                      class="h-10 w-10 text-slate-300 mb-3"
                    ></lucide-icon>
                    <p class="text-lg font-medium text-slate-700">Queue is empty</p>
                    <p class="text-sm">There are no pending policies to verify right now.</p>
                  </div>
                </td>
              </tr>
            }

            @for (item of queue(); track item) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  #{{ item.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900">
                    {{ item.customerName || 'Customer' }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ item.customerEmail || 'customer@example.com' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div class="font-medium text-slate-800">
                    {{ item.planName || 'Standard Package' }}
                  </div>
                  <div class="text-xs">{{ item.tier || 'Gold' }} Tier</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {{ (item.createdAt | date: 'short') || 'Recently' }}
            </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    (click)="verify(item.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                  >
                    <lucide-icon name="check-circle" class="mr-1.5 h-3.5 w-3.5"></lucide-icon>
                    Verify Policy
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class VerificationQueueComponent implements OnInit {
  private agentService = inject(AgentService);
  private toastr = inject(ToastrService);

  queue = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadQueue();
  }

  loadQueue() {
    this.isLoading.set(true);
    this.agentService.getVerificationQueue().subscribe({
      next: (res) => {
        this.queue.set(res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load pending policies.');
        this.isLoading.set(false);
      },
    });
  }

  verify(id: string) {
    this.isLoading.set(true);
    this.agentService.verifyPolicy(id).subscribe({
      next: () => {
        this.toastr.success('Policy has been verified and set to Active.');
        this.loadQueue();
      },
      error: () => {
        this.toastr.error('Verification failed.');
        this.isLoading.set(false);
      },
    });
  }
}
