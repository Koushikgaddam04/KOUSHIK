import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../customer.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-family-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h2 class="text-2xl font-black text-slate-900">My Family (Dependents)</h2>
        <p class="text-slate-500 font-medium">Manage your dependents to include them in Family Floater plans.</p>
      </div>

      <!-- Add Dependent Form -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
        <h3 class="text-lg font-bold mb-4">Add New Dependent</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-black uppercase text-slate-500 mb-2">Full Name</label>
            <input [(ngModel)]="newDependent.name" type="text" placeholder="Member Name" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none">
          </div>
          <div>
            <label class="block text-xs font-black uppercase text-slate-500 mb-2">Age</label>
            <input [(ngModel)]="newDependent.age" type="number" [min]="ageMin" [max]="ageMax" placeholder="Years" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none">
            <p class="text-[10px] text-slate-400 mt-1 font-bold italic uppercase tracking-widest">
               {{ newDependent.relationship === 'Child' ? 'Age: 0-18 Required' : 'Age: 18-100 Required' }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-black uppercase text-slate-500 mb-2">Relationship</label>
            <select [(ngModel)]="newDependent.relationship" (change)="adjustAge()" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none">
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
            </select>
          </div>
        </div>
        <button (click)="addDependent()" class="mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all active:scale-[0.98]">
          Add Member
        </button>
      </div>

      <!-- Dependent List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let member of dependents()" class="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
               {{ member.name.charAt(0) }}
             </div>
             <div>
                <p class="font-bold text-slate-900">{{ member.name }}</p>
                <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
                   <span>{{ member.relationship }}</span>
                   <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <span>{{ member.age }} years</span>
                </div>
             </div>
          </div>
          <button (click)="deleteMember(member.id)" class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
             <lucide-icon name="trash-2" class="h-4 w-4"></lucide-icon>
          </button>
        </div>
      </div>
      
      <div *ngIf="dependents().length === 0" class="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
         <lucide-icon name="users" class="h-10 w-10 text-slate-300 mb-4"></lucide-icon>
         <p class="text-slate-400 font-medium text-sm">No dependents added yet.</p>
      </div>
    </div>
  `
})
export class FamilyManagementComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastr = inject(ToastrService);

  dependents = signal<any[]>([]);
  newDependent = { name: '', age: 18, relationship: 'Spouse' };

  get ageMin(): number {
    return this.newDependent.relationship === 'Child' ? 0 : 18;
  }

  get ageMax(): number {
    return this.newDependent.relationship === 'Child' ? 18 : 100;
  }

  adjustAge() {
    if (this.newDependent.relationship === 'Child' && this.newDependent.age > 18) {
      this.newDependent.age = 5;
    } else if (this.newDependent.relationship !== 'Child' && this.newDependent.age < 18) {
      this.newDependent.age = 30;
    }
  }

  ngOnInit() {
    this.loadDependents();
  }

  loadDependents() {
    this.customerService.getMyDependents().subscribe({
      next: (data) => this.dependents.set(data),
      error: () => this.toastr.error('Failed to load family members')
    });
  }

  addDependent() {
    if (!this.newDependent.name) return;

    // Enforcement check
    if (this.newDependent.age < this.ageMin || this.newDependent.age > this.ageMax) {
      this.toastr.error(`Invalid age for ${this.newDependent.relationship}. Must be between ${this.ageMin} and ${this.ageMax}.`);
      return;
    }
    this.customerService.addDependent(this.newDependent).subscribe({
      next: () => {
        this.toastr.success('Family member added');
        this.newDependent = { name: '', age: 18, relationship: 'Spouse' };
        this.loadDependents();
      },
      error: () => this.toastr.error('Failed to add member')
    });
  }

  deleteMember(id: number) {
    if (confirm('Are you sure you want to remove this family member?')) {
      this.customerService.deleteDependent(id).subscribe({
        next: () => {
          this.toastr.success('Member removed');
          this.loadDependents();
        },
        error: () => this.toastr.error('Failed to remove member')
      });
    }
  }
}
