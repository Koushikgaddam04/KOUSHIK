import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Trash2, Shield, Filter, Search, Plus, X, User, Briefcase } from 'lucide-angular';

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

    <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manage Policies</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Configure global insurance plans and assign administrative tasks.</p>
      </div>
      <button
        (click)="openCreateModal()"
        class="group inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-lg shadow-blue-500/20 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <lucide-icon name="plus" class="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300"></lucide-icon>
        Create New Plan
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
          class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <div
            class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            (click)="closeCreateModal()"
          ></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
            >&#8203;</span
          >
          <div
            class="relative inline-block align-bottom bg-white dark:bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-slate-200 dark:border-slate-800"
          >
            <form [formGroup]="createForm" (ngSubmit)="submitCreate()">
              <div class="bg-white dark:bg-slate-900 px-6 pt-6 pb-6">
                <div class="mb-6 flex items-center justify-between">
                   <div class="flex items-center gap-3">
                      <div class="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <lucide-icon name="shield" class="h-6 w-6"></lucide-icon>
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">Define New Plan</h3>
                        <p class="text-xs text-slate-500 font-medium">Create a template for customers to apply for.</p>
                      </div>
                   </div>
                   <button type="button" (click)="closeCreateModal()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <lucide-icon name="x" class="h-5 w-5"></lucide-icon>
                   </button>
                </div>

                <div class="space-y-5">
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Plan Name</label>
                      <input
                        type="text"
                        formControlName="planName"
                        placeholder="e.g. Platinum Plus Premium"
                        class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Description & Benefits</label>
                      <textarea
                        formControlName="planDescription"
                        rows="3"
                        placeholder="Detail the plan benefits, copays, terms, etc."
                        class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                      ></textarea>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Monthly Premium</label>
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          formControlName="monthlyPremium"
                          min="0"
                          class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl shadow-sm py-2.5 pl-8 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Coverage Limit</label>
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          formControlName="coverageAmount"
                          min="0"
                          class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl shadow-sm py-2.5 pl-8 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Initial Expiry</label>
                      <input
                        type="date"
                        formControlName="expiryDate"
                        [min]="minDate"
                        class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Assigned Agent</label>
                      <select
                        formControlName="agentId"
                        class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all sm:text-sm appearance-none cursor-pointer"
                      >
                        <option [ngValue]="null">Leave Unassigned</option>
                        @for (agent of agents(); track agent.id) {
                          <option [value]="agent.id">{{ agent.name }}</option>
                        }
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 border-t dark:border-slate-800">
                <button
                  type="submit"
                  [disabled]="createForm.invalid || isLoading()"
                  class="flex-1 inline-flex justify-center items-center rounded-xl px-6 py-3 bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 focus:outline-none disabled:opacity-50 transition-all active:scale-95"
                >
                  Confirm & Create Plan
                </button>
                <button
                  type="button"
                  (click)="closeCreateModal()"
                  class="flex-1 inline-flex justify-center items-center rounded-xl px-6 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div class="relative w-full md:w-80 group">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search policies by ID or plan..."
            (input)="onSearch($event)"
            class="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
           <lucide-icon name="filter" class="h-3 w-3"></lucide-icon>
           Showing {{ filteredPolicies().length }} results
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Policy ID</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plan Details</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Responsible Agent</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Claims Specialist</th>
              <th scope="col" class="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            @if (filteredPolicies().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                  <p>No recent policies found.</p>
                </td>
              </tr>
            }
            @for (policy of filteredPolicies(); track policy) {
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                <td class="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-slate-900 dark:text-white">
                  #{{ policy.id }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {{ policy.planName || '' }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5" *ngIf="policy.isPlanTemplate">
                    Plan Template
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest border rounded-full shadow-sm"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800': policy.status === 'Active',
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800': policy.status === 'Pending',
                      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800': policy.status === 'Inactive'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                      'bg-emerald-500': policy.status === 'Active',
                      'bg-amber-500': policy.status === 'Pending',
                      'bg-rose-500': policy.status === 'Inactive'
                    }"></span>
                    {{ policy.status }}
                  </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="relative max-w-[160px]">
                    <select
                      class="block w-full text-xs font-bold border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer border shadow-sm"
                      [ngModel]="policy.agentId"
                      (ngModelChange)="onAssignAgent(policy.id, $event)"
                    >
                      <option [ngValue]="null">Unassigned</option>
                      @for (agent of agents(); track agent) {
                        <option [value]="agent.id">{{ agent.name }}</option>
                      }
                    </select>
                    <lucide-icon name="user" class="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none"></lucide-icon>
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <div class="relative max-w-[160px]">
                    <select
                      class="block w-full text-xs font-bold border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer border shadow-sm"
                      [ngModel]="policy.claimsOfficerId"
                      (ngModelChange)="onAssignOfficer(policy.id, $event)"
                    >
                      <option [ngValue]="null">Unassigned</option>
                      @for (officer of claimsOfficers(); track officer.id) {
                        <option [value]="officer.id">{{ officer.name }}</option>
                      }
                    </select>
                    <lucide-icon name="briefcase" class="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none"></lucide-icon>
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-right">
                  <button
                    (click)="openDeleteModal(policy.id)"
                    class="text-rose-600 hover:text-white hover:bg-rose-600 dark:text-rose-400 dark:hover:bg-rose-500 p-2 rounded-xl transition-all duration-200 shadow-sm border border-rose-100 dark:border-rose-900/50 active:scale-90"
                    title="Deactivate Plan"
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
          <p>Showing 1 to {{ filteredPolicies().length }} of {{ policies().length }} results</p>
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
  claimsOfficers = signal<any[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  minDate = new Date().toISOString().split('T')[0];

  filteredPolicies = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.policies();
    if (!term) return all;
    return all.filter(p =>
      p.id?.toString().includes(term) ||
      (p.planName || '').toLowerCase().includes(term) ||
      (p.status || '').toLowerCase().includes(term)
    );
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  showModal = signal(false);
  policyToDelete = signal<string | null>(null);

  showCreateModal = signal(false);

  createForm = this.fb.group({
    userId: [1, [Validators.required, Validators.min(1)]],
    agentId: [null],
    claimsOfficerId: [null],
    planName: ['', Validators.required],
    planDescription: ['', Validators.required],
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
      error: (err) => console.log('Error fetching agents'),
    });

    this.adminService.getClaimsOfficers().subscribe({
      next: (res) => this.claimsOfficers.set(res || []),
      error: (err) => console.log('Error fetching claims officers'),
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

  onAssignOfficer(policyId: string, officerId: string) {
    if (!officerId) return;

    this.isLoading.set(true);
    this.adminService.assignOfficer(policyId, officerId).subscribe({
      next: () => {
        this.toastr.success('Claims Officer assigned to policy.');
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to assign claims officer.');
        this.isLoading.set(false);
        this.loadData();
      },
    });
  }

  openCreateModal() {
    this.createForm.reset({
      userId: 1,
      planName: '',
      planDescription: '',
      status: 'Active',
      agentId: null,
      claimsOfficerId: null,
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

      this.adminService.createPolicy(formValue).subscribe({
        next: (res: any) => {
          this.toastr.success('Policy created successfully.');
          this.closeCreateModal();
          this.loadData(); // Refresh list
        },
        error: (err) => {
          this.toastr.error('Failed to create policy.');
          this.isLoading.set(false);
        },
      });
    }
  }
}
