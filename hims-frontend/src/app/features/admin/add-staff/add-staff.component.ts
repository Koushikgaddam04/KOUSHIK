import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, UserPlus, Mail, Lock, Briefcase } from 'lucide-angular';

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner
      [show]="isLoading()"
      message="Creating Staff Member..."
    ></app-loading-spinner>

    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Add New Staff</h1>
        <p class="text-slate-500 mt-1">Register new Agents or Claims Officers into the system.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div class="bg-blue-100 p-2 rounded-lg text-blue-600">
            <lucide-icon name="user-plus" class="h-5 w-5"></lucide-icon>
          </div>
          <h2 class="text-lg font-semibold text-slate-800">Staff Details</h2>
        </div>

        <form class="p-6 space-y-5" [formGroup]="staffForm" (ngSubmit)="onSubmit()">
          <div>
            <label class="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              formControlName="fullName"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Email Address</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucide-icon name="mail" class="h-4 w-4 text-slate-400"></lucide-icon>
              </div>
              <input
                type="email"
                formControlName="email"
                required
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-slate-300 rounded-md py-2 border outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Role</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucide-icon name="briefcase" class="h-4 w-4 text-slate-400"></lucide-icon>
              </div>
              <select
                formControlName="role"
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-slate-300 rounded-md py-2 border outline-none appearance-none"
              >
                <option value="Agent">Agent</option>
                <option value="ClaimOfficer">Claims Officer</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Temporary Password</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucide-icon name="lock" class="h-4 w-4 text-slate-400"></lucide-icon>
              </div>
              <input
                type="password"
                formControlName="password"
                required
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-slate-300 rounded-md py-2 border outline-none"
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
  `,
})
export class AddStaffComponent {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  isLoading = signal(false);

  staffForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Agent', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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
