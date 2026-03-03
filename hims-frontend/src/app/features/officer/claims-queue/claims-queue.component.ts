import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../officer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LucideAngularModule, Check, X, FileText, Search } from 'lucide-angular';

@Component({
  selector: 'app-claims-queue',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ConfirmationModalComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Processing Claim..."></app-loading-spinner>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Claims Queue</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Review, approve, or reject customer health claims.</p>
    </div>

    <!-- Reject Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="showRejectModal()"
      title="Reject Claim"
      message="Are you sure you want to reject this claim? The customer will be optionally notified."
      confirmText="Reject Claim"
      (confirm)="confirmReject()"
      (close)="closeModal()"
    ></app-confirmation-modal>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div class="relative w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search claims..."
            (input)="onSearch($event)"
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
                Claim ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Policy Ref
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Reason
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Decisions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @if (filteredQueue().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  <div class="flex flex-col items-center">
                    <lucide-icon
                      name="file-text"
                      class="h-10 w-10 text-slate-300 mb-3"
                    ></lucide-icon>
                    <p class="text-lg font-medium text-slate-700">No Pending Claims</p>
                    <p class="text-sm">You've caught up on all the submitted claims.</p>
                  </div>
                </td>
              </tr>
            }

            @for (claim of filteredQueue(); track claim.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  #{{ claim.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <a href="#" class="text-blue-600 hover:underline">Policy #{{ claim.policyId }}</a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                  {{ claim.amount | currency }}
                </td>
                <td class="px-6 py-4 text-sm text-slate-500 max-w-sm">
                  <p class="truncate">{{ claim.reason }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    (click)="approve(claim.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                  >
                    <lucide-icon name="check" class="mr-1 h-3.5 w-3.5"></lucide-icon>
                    Approve
                  </button>
                  <button
                    (click)="openRejectModal(claim.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
                  >
                    <lucide-icon name="x" class="mr-1 h-3.5 w-3.5"></lucide-icon>
                    Reject
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
export class ClaimsQueueComponent implements OnInit {
  private officerService = inject(OfficerService);
  private toastr = inject(ToastrService);

  queue = signal<any[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);

  filteredQueue = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.queue();
    if (!term) return all;
    return all.filter(c =>
      c.id.toString().toLowerCase().includes(term) ||
      c.policyId.toString().toLowerCase().includes(term) ||
      c.reason.toLowerCase().includes(term)
    );
  });

  showRejectModal = signal(false);
  claimToReject = signal<string | null>(null);

  ngOnInit() {
    this.loadQueue();
  }

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
  }

  loadQueue() {
    this.isLoading.set(true);
    this.officerService.getPendingClaims().subscribe({
      next: (res) => {
        this.queue.set(res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load pending claims.');
        this.isLoading.set(false);
      },
    });
  }

  approve(id: string) {
    this.isLoading.set(true);
    this.officerService.decideClaim(id, 'Approved').subscribe({
      next: () => {
        this.toastr.success('Claim Approved Successfully.');
        this.loadQueue();
      },
      error: (err) => {
        // Robust error message extraction
        let errorMsg = 'Failed to approve claim.';
        if (err?.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.Message || err.error.message) {
            errorMsg = err.error.Message || err.error.message;
          }
        }

        this.toastr.error(errorMsg);
        this.isLoading.set(false);
        this.loadQueue(); // Refresh to show the (auto-rejected) status
      },
    });
  }

  openRejectModal(id: string) {
    this.claimToReject.set(id);
    this.showRejectModal.set(true);
  }

  closeModal() {
    this.showRejectModal.set(false);
    this.claimToReject.set(null);
  }

  confirmReject() {
    const id = this.claimToReject();
    if (id) {
      this.isLoading.set(true);
      this.officerService.decideClaim(id, 'Rejected').subscribe({
        next: () => {
          this.toastr.success('Claim Rejected Successfully.');
          this.closeModal();
          this.loadQueue();
        },
        error: (err) => {
          let errorMsg = 'Failed to reject claim.';
          if (err?.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error;
            } else if (err.error.Message || err.error.message) {
              errorMsg = err.error.Message || err.error.message;
            }
          }
          this.toastr.error(errorMsg);
          this.isLoading.set(false);
          this.closeModal();
        },
      });
    }
  }
}
