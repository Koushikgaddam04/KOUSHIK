import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, UserPlus, Mail, Lock, Briefcase, Users, UserCheck } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner
      [show]="isLoading()"
      message="Processing..."
    ></app-loading-spinner>

    <div class="max-w-6xl mx-auto space-y-12 pb-12">
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Add New Staff</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Register new Agents or Claims Officers into the system.</p>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div class="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <lucide-icon name="user-plus" class="h-5 w-5"></lucide-icon>
            </div>
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Staff Details</h2>
          </div>

          <form class="p-6 space-y-5" [formGroup]="staffForm" (ngSubmit)="onSubmit()">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                formControlName="fullName"
                required
                class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="mail" class="h-4 w-4 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  type="email"
                  formControlName="email"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md py-2 border outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="briefcase" class="h-4 w-4 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <select
                  formControlName="role"
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md py-2 border outline-none appearance-none"
                >
                  <option value="Agent">Agent</option>
                  <option value="ClaimOfficer">Claims Officer</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Temporary Password</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucide-icon name="lock" class="h-4 w-4 text-slate-400 dark:text-slate-500"></lucide-icon>
                </div>
                <input
                  type="password"
                  formControlName="password"
                  required
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md py-2 border outline-none"
                />
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button
                type="submit"
                [disabled]="staffForm.invalid || isLoading()"
                class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none disabled:opacity-50 transition-colors"
              >
                Create Staff Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Staff List Section -->
      <div>
        <div class="mb-6 flex items-center gap-3">
          <div class="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
            <lucide-icon name="users" class="h-5 w-5"></lucide-icon>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Existing Staff Members</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Overview of all active Agents and Claims Officers</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (person of staff(); track person.id) {
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all">
              <div class="flex items-start justify-between mb-4">
                <div class="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-slate-600 dark:text-slate-400">
                  <lucide-icon [name]="person.role === 'Agent' ? 'user-check' : 'briefcase'" class="h-6 w-6"></lucide-icon>
                </div>
                <span 
                  [ngClass]="{
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': person.role === 'Agent',
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': person.role === 'ClaimsOfficer'
                  }"
                  class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                >
                  {{ person.role === 'Agent' ? 'Agent' : 'Claims Officer' }}
                </span>
              </div>
              
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{{ person.fullName }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4">
                <lucide-icon name="mail" class="h-3 w-3"></lucide-icon>
                {{ person.email }}
              </p>
              
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <div class="flex justify-between text-xs text-slate-400">
                  <span>Joined</span>
                  <span>{{ person.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <p class="text-slate-400 italic">No staff members found.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AddStaffComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  isLoading = signal(false);
  staff = signal<any[]>([]);

  staffForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Agent', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.adminService.getStaff().subscribe({
      next: (data) => {
        this.staff.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Failed to load staff list.');
      }
    });
  }

  onSubmit() {
    if (this.staffForm.valid) {
      this.isLoading.set(true);
      const { role, ...rest } = this.staffForm.value;
      // Agent = 2, ClaimsOfficer = 4
      const roleId = role === 'Agent' ? 2 : 4;
      const payload = { ...rest, roleId };

      this.adminService.addStaff(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastr.success(`${role} created successfully.`);
          this.staffForm.reset({ role: 'Agent' });
          this.loadStaff(); // Refresh list
        },
        error: (err) => {
          this.isLoading.set(false);
          let errorMsg = 'Failed to create staff member.';
          if (typeof err.error === 'string') {
            errorMsg = err.error || errorMsg;
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          }
          this.toastr.error(errorMsg, 'Error');
          console.error('Add staff error:', err);
        },
      });
    }
  }
}
