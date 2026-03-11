import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, UserPlus, Mail, Lock, Briefcase, Users, UserCheck, User, Shield, Filter } from 'lucide-angular';
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
        <div class="mb-8 text-center sm:text-left">
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Onboard Staff</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Provision access for new administrative agents and claims processors.</p>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
          <div class="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-4">
            <div class="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <lucide-icon name="user-plus" class="h-6 w-6"></lucide-icon>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Credentials & Role</h2>
              <p class="text-xs text-slate-500 font-medium">Define profile identity and system permissions.</p>
            </div>
          </div>

          <form class="p-8 space-y-6" [formGroup]="staffForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-1 md:col-span-2">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Legal Name</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="user" class="h-4 w-4 text-slate-400"></lucide-icon>
                  </div>
                  <input
                    type="text"
                    formControlName="fullName"
                    placeholder="e.g. Johnathan Smith"
                    class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-2xl shadow-sm py-3 pl-11 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="mail" class="h-4 w-4 text-slate-400"></lucide-icon>
                  </div>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="name@company.com"
                    class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-2xl shadow-sm py-3 pl-11 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">System Role</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="briefcase" class="h-4 w-4 text-slate-400"></lucide-icon>
                  </div>
                  <select
                    formControlName="role"
                    class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-2xl shadow-sm py-3 pl-11 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all sm:text-sm appearance-none cursor-pointer"
                  >
                    <option value="Agent">Insurance Agent</option>
                    <option value="ClaimOfficer">Claims Manager</option>
                  </select>
                </div>
              </div>

              <div class="col-span-1 md:col-span-2">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Temporary Access Key</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="lock" class="h-4 w-4 text-slate-400"></lucide-icon>
                  </div>
                  <input
                    type="password"
                    formControlName="password"
                    placeholder="Min 6 characters"
                    class="block w-full border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white rounded-2xl shadow-sm py-3 pl-11 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                [disabled]="staffForm.invalid || isLoading()"
                class="w-full inline-flex justify-center items-center py-4 px-6 border border-transparent shadow-lg shadow-blue-500/20 text-sm font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                <lucide-icon name="user-check" class="mr-2 h-5 w-5"></lucide-icon>
                Finalize & Register Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Staff List Section -->
      <div>
        <div class="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <lucide-icon name="users" class="h-6 w-6"></lucide-icon>
            </div>
            <div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Roster</h2>
              <p class="text-sm text-slate-500 font-medium">Managing {{ staff().length }} institutional personnel.</p>
            </div>
          </div>
          <div class="flex items-center bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-widest gap-2">
             <lucide-icon name="filter" class="h-3 w-3"></lucide-icon>
             Total Personnel
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (person of staff(); track person.id) {
            <div class="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4">
                 <div 
                  [ngClass]="{
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800': person.role === 'Agent',
                    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-100 dark:border-purple-800': person.role === 'ClaimsOfficer'
                  }"
                  class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm"
                >
                  {{ person.role === 'Agent' ? 'Agent' : 'Manager' }}
                </div>
              </div>

              <div class="flex items-center gap-4 mb-6">
                <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <lucide-icon [name]="person.role === 'Agent' ? 'user-check' : 'shield'" class="h-6 w-6"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ person.fullName }}</h3>
                  <div class="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                    <lucide-icon name="mail" class="h-3 w-3"></lucide-icon>
                    {{ person.email }}
                  </div>
                </div>
              </div>
              
              <div class="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                 <div class="flex flex-col">
                    <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400">Assignment</span>
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{{ person.role === 'Agent' ? 'Field Sales' : 'Risk Review' }}</span>
                 </div>
                 <div class="flex flex-col text-right">
                    <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400">Tenure</span>
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{{ person.createdAt | date:'MMM yyyy' }}</span>
                 </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm inline-block mb-4">
                  <lucide-icon name="users" class="h-8 w-8 text-slate-300"></lucide-icon>
               </div>
              <p class="text-slate-500 font-black text-lg">No staff members found.</p>
              <p class="text-slate-400 text-sm mt-1">Begin by registering your first employee above.</p>
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
