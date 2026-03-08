import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Trash2, Shield, Filter, Search } from 'lucide-angular';

@Component({
  selector: 'app-manage-policies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationModalComponent,
    LoadingSpinnerComponent,
    LucideAngularModule,
  ],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Policies..."></app-loading-spinner>

    <div class="mb-6 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Policies</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">View recent policies and assign agents to them.</p>
      </div>
      <button
        (click)="openCreateModal()"
        class="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
      >
        <lucide-icon name="shield" class="mr-2 h-4 w-4"></lucide-icon>
        Create Policy
      </button>
    </div>

    <!-- Soft Delete Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="showModal()"
      title="Delete Policy"
      message="Are you sure you want to soft-delete this policy? The customer will lose coverage."
      confirmText="Deactivate Policy"
      (confirm)="confirmDelete()"
      (close)="closeModal()"
    ></app-confirmation-modal>

    <!-- Create Policy Modal -->
    @if (showCreateModal()) {
      <div
        class="fixed z-50 inset-0 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-slate-950 dark:bg-opacity-80 transition-opacity"
            aria-hidden="true"
            (click)="closeCreateModal()"
          ></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
            >&#8203;</span
          >
          <div
            class="relative inline-block align-bottom bg-white dark:bg-slate-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-transparent dark:border-slate-800"
          >
            <form [formGroup]="createForm" (ngSubmit)="submitCreate()">
              <div class="bg-white dark:bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-slate-100" id="modal-title">
                      Create New Policy
                    </h3>
                    <div class="mt-4 space-y-4">
                      <!-- <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">User ID</label>
                        <input
                          type="number"
                          formControlName="userId"
                          class="mt-1 block w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div> -->
                      <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Plan Name</label>
                          <input
                            type="text"
                            formControlName="planName"
                            placeholder="e.g. Platinum Plus Premium"
                            class="mt-1 block w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300"
                            >Monthly Premium</label
                          >
                          <input
                            type="number"
                            formControlName="monthlyPremium"
                            min="0"
                            class="mt-1 block w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300"
                            >Coverage Amount</label
                          >
                          <input
                            type="number"
                            formControlName="coverageAmount"
                            min="0"
                            class="mt-1 block w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Expiry Date</label>
                          <input
                            type="date"
                            formControlName="expiryDate"
                            [min]="minDate"
                            class="mt-1 block w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300"
                            >Assign Agent (Optional)</label
                          >
                          <select
                            formControlName="agentId"
                            class="mt-1 block w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-800"
                          >
                            <option [ngValue]="null">Unassigned</option>
                            @for (agent of agents(); track agent) {
                              <option [value]="agent.id">{{ agent.name }}</option>
                            }
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t dark:border-slate-800">
                <button
                  type="submit"
                  [disabled]="createForm.invalid || isLoading()"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  (click)="closeCreateModal()"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-900 text-base font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div class="relative w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search policies..."
            class="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                Plan Details
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Assigned Agent
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
            @if (policies().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                  <p>No recent policies found.</p>
                </td>
              </tr>
            }
            @for (policy of policies(); track policy) {
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                  #{{ policy.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <div class="font-medium text-slate-800 dark:text-slate-200">
                    {{ policy.planName || '' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': policy.status === 'Active',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': policy.status === 'Pending',
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300':
                        policy.status !== 'Active' && policy.status !== 'Pending',
                    }"
                  >
                    {{ policy.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <select
                    class="block w-full text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md py-1.5 focus:border-blue-500 focus:ring-blue-500 outline-none p-1 border appearance-none"
                    [ngModel]="policy.agentId"
                    (ngModelChange)="onAssignAgent(policy.id, $event)"
                  >
                    <option [ngValue]="null">Unassigned</option>
                    @for (agent of agents(); track agent) {
                      <option [value]="agent.id">{{ agent.name }}</option>
                    }
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    (click)="openDeleteModal(policy.id)"
                    class="text-red-600 hover:text-red-900 dark:hover:text-red-400 bg-red-50 dark:bg-red-900/10 p-1.5 rounded-md transition-colors"
                    title="Soft Delete"
                  >
                    <lucide-icon name="trash-2" class="h-4 w-4"></lucide-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div
        class="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 sm:px-6"
      >
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between text-sm text-slate-600 dark:text-slate-400"
        >
          <p>Showing 1 to {{ policies().length }} of {{ policies().length }} results</p>
        </div>
      </div>
    </div>
  `,
})
export class ManagePoliciesComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  policies = signal<any[]>([]);
  agents = signal<any[]>([]);
  isLoading = signal(false);
  minDate = new Date().toISOString().split('T')[0];

  showModal = signal(false);
  policyToDelete = signal<string | null>(null);

  showCreateModal = signal(false);

  createForm = this.fb.group({
    userId: [1, [Validators.required, Validators.min(1)]],
    agentId: [null],
    planName: ['', Validators.required],
    monthlyPremium: [0, [Validators.required, Validators.min(0)]],
    coverageAmount: [0, [Validators.required, Validators.min(0)]],
    expiryDate: ['', Validators.required],
    status: ['Active'],
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // Fetch both policies and agents
    this.adminService.getRecentPolicies().subscribe({
      next: (res) => {
        this.policies.set(res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load policies.');
        this.isLoading.set(false);
      },
    });

    this.adminService.getAgents().subscribe({
      next: (res) => this.agents.set(res || []),
      error: (err) => console.log('Notice: /api/Staff/agents might need implementation on backend'),
    });
  }

  openDeleteModal(id: string) {
    this.policyToDelete.set(id);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.policyToDelete.set(null);
  }

  confirmDelete() {
    const id = this.policyToDelete();
    if (id) {
      this.isLoading.set(true);
      this.adminService.deletePolicy(id).subscribe({
        next: () => {
          this.toastr.success('Policy successfully deleted.');
          this.closeModal();
          this.loadData(); // Refresh list
        },
        error: () => {
          this.toastr.error('Failed to delete policy.');
          this.isLoading.set(false);
          this.closeModal();
        },
      });
    }
  }

  onAssignAgent(policyId: string, agentId: string) {
    if (!agentId) return;

    this.isLoading.set(true);
    this.adminService.assignPolicy(policyId, agentId).subscribe({
      next: () => {
        this.toastr.success('Agent assigned to policy.');
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to assign agent.');
        this.isLoading.set(false);
        this.loadData(); // Revert select on error by reloading
      },
    });
  }

  openCreateModal() {
    this.createForm.reset({
      userId: 1,
      planName: '',
      status: 'Active',
      agentId: null,
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  submitCreate() {
    if (this.createForm.valid) {
      this.isLoading.set(true);
      const formValue = this.createForm.value;
      const agentId = formValue.agentId;

      this.adminService.createPolicy(formValue).subscribe({
        next: (res: any) => {
          if (agentId && res && res.id) {
            this.adminService.assignPolicy(res.id, agentId).subscribe({
              next: () => {
                this.toastr.success('Policy created and agent assigned.');
                this.closeCreateModal();
                this.loadData();
              },
              error: () => {
                this.toastr.warning('Policy created, but agent assignment failed.');
                this.closeCreateModal();
                this.loadData();
              },
            });
          } else {
            this.toastr.success('Policy created successfully.');
            this.closeCreateModal();
            this.loadData(); // Refresh list
          }
        },
        error: (err) => {
          this.toastr.error('Failed to create policy.');
          this.isLoading.set(false);
        },
      });
    }
  }
}
