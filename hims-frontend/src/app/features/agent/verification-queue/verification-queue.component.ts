import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, CheckCircle, Search, ClipboardList, Eye } from 'lucide-angular';
import { UserDocumentsModalComponent } from '../../../shared/components/user-documents-modal/user-documents-modal.component';

@Component({
  selector: 'app-verification-queue',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule, UserDocumentsModalComponent],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Processing Policy..."></app-loading-spinner>
    
    <app-user-documents-modal 
      [show]="showDocsModal()" 
      [userId]="selectedUserId()" 
      (close)="showDocsModal.set(false)">
    </app-user-documents-modal>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Verification Queue</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Review and verify pending customer policies.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div class="relative w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search queue..."
            class="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Policy ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Customer Info
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Plan Details
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Submitted
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
            @if (queue().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <div class="flex flex-col items-center">
                    <lucide-icon
                      name="clipboard-list"
                      class="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3"
                    ></lucide-icon>
                    <p class="text-lg font-medium text-slate-700 dark:text-slate-300">Queue is empty</p>
                    <p class="text-sm">There are no pending policies to verify right now.</p>
                  </div>
                </td>
              </tr>
            }

            @for (item of queue(); track item.id) {
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  #{{ item.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ item.customerName || 'Customer' }}
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    {{ item.customerEmail || 'customer@example.com' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <div class="font-medium text-slate-800 dark:text-slate-200">
                    {{ item.planName || 'Standard Package' }}
                  </div>
                  <div class="text-xs">{{ item.tier || 'Gold' }} Tier</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {{ (item.createdAt | date: 'short') || 'Recently' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    (click)="viewDocs(item.userId)"
                    class="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-medium rounded shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors"
                  >
                    <lucide-icon name="eye" class="mr-1.5 h-3.5 w-3.5"></lucide-icon>
                    View Docs
                  </button>
                  <button
                    (click)="verify(item.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                  >
                    <lucide-icon name="check-circle" class="mr-1.5 h-3.5 w-3.5"></lucide-icon>
                    Verify
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
  showDocsModal = signal(false);
  selectedUserId = signal<number>(0);

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

  viewDocs(userId: number) {
    this.selectedUserId.set(userId);
    this.showDocsModal.set(true);
  }
}
