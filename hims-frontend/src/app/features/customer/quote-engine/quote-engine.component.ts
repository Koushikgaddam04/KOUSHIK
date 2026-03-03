import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Calculator, Activity, CheckCircle2 } from 'lucide-angular';

@Component({
  selector: 'app-quote-engine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Calculating Quote..."></app-loading-spinner>

    <div class="max-w-3xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Get a Quote</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">
          Fill in your details to get an instant tailored insurance quote.
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Step 1: Form -->
        @if (!quoteResult()) {
          <div class="p-8">
            <form [formGroup]="quoteForm" (ngSubmit)="calculate()" class="space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-slate-700">Age</label>
                  <input
                    type="number"
                    formControlName="age"
                    min="18"
                    max="100"
                    class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
                  />
                </div>
                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-slate-700">Plan Name</label>
                  <select
                    formControlName="planName"
                    class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none appearance-none"
                  >
                    <option value="" disabled>Select a plan</option>
                    @for (plan of availablePlans(); track plan) {
                       <option [value]="plan">{{ plan }}</option>
                    }
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-2">Coverage Tier</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label
                      class="relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500':
                          quoteForm.get('tier')?.value === 'Silver',
                        'border-slate-200': quoteForm.get('tier')?.value !== 'Silver',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Silver" class="sr-only" />
                      <span class="block text-sm font-medium text-slate-900">Silver</span>
                      <span class="block text-sm text-slate-500 mt-1">Essential coverage.</span>
                    </label>
                    <label
                      class="relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500':
                          quoteForm.get('tier')?.value === 'Gold',
                        'border-slate-200': quoteForm.get('tier')?.value !== 'Gold',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Gold" class="sr-only" />
                      <span class="block text-sm font-medium text-slate-900">Gold</span>
                      <span class="block text-sm text-slate-500 mt-1">Most popular choice.</span>
                    </label>
                    <label
                      class="relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500':
                          quoteForm.get('tier')?.value === 'Platinum',
                        'border-slate-200': quoteForm.get('tier')?.value !== 'Platinum',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Platinum" class="sr-only" />
                      <span class="block text-sm font-medium text-slate-900">Platinum</span>
                      <span class="block text-sm text-slate-500 mt-1">Maximum protection.</span>
                    </label>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-slate-700"
                    >Pre-existing Conditions</label
                  >
                  <textarea
                    formControlName="preExistingConditions"
                    rows="3"
                    class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
                    placeholder="None"
                  ></textarea>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  [disabled]="quoteForm.invalid || isLoading()"
                  class="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none disabled:opacity-50 transition-colors"
                >
                  <lucide-icon name="calculator" class="mr-2 h-4 w-4"></lucide-icon>
                  Calculate Quote
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Step 2: Result -->
        @if (quoteResult()) {
          <div class="p-8 text-center">
            <div
              class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
            >
              <lucide-icon name="check-circle-2" class="h-8 w-8 text-green-600"></lucide-icon>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Your Estimated Premium</h2>
            <div class="text-5xl font-extrabold text-blue-600 mb-6">
              {{ quoteResult().monthlyPremium | currency }}
              <span class="text-lg text-slate-500 font-normal">/mo</span>
            </div>
            <div
              class="bg-slate-50 rounded-lg p-4 max-w-sm mx-auto mb-8 border border-slate-200 text-left space-y-3"
            >
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Tier Selected</span>
                <span class="font-medium text-slate-900">{{ quoteResult().tier }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Coverage Amount</span>
                <span class="font-medium text-slate-900">{{
                  quoteResult().coverageAmount | currency
                }}</span>
              </div>
              
            </div>
            <div class="flex justify-center gap-4">
              <button
                (click)="resetForm()"
                class="px-6 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Recalculate
              </button>
              <button
                (click)="buyPolicy()"
                class="px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
              >
                Request for policy
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class QuoteEngineComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  isLoading = signal(false);
  quoteResult = signal<any | null>(null);
  availablePlans = signal<string[]>([]);

  quoteForm = this.fb.group({
    age: [30, [Validators.required, Validators.min(18)]],
    planName: ['', Validators.required],
    tier: ['Gold', Validators.required],
    preExistingConditions: [''],
  });

  ngOnInit() {
    this.customerService.getActivePlans().subscribe({
      next: (policies) => {
        // Extract unique plan names to ensure the dropdown works efficiently
        const uniquePlans = [...new Set((policies || []).map(p => p.planName).filter(Boolean))];

        this.availablePlans.set(uniquePlans as string[]);
        if (uniquePlans.length > 0) {
          this.quoteForm.patchValue({ planName: uniquePlans[0] });
        }
      }
    });
  }

  calculate() {
    if (this.quoteForm.valid) {
      this.isLoading.set(true);
      const payload = this.quoteForm.value;

      this.customerService.calculateQuote(payload).subscribe({
        next: (res) => {
          // Store the UI submitted planName so the activation UI uses it instead of dummy data
          this.quoteResult.set({ ...res, planName: this.quoteForm.value.planName });
          this.toastr.success('Quote calculated successfully!');
          this.isLoading.set(false);
        },
        error: () => {
          this.toastr.error('Error calculating quote.');
          this.isLoading.set(false);
        },
      });
    }
  }

  resetForm() {
    this.quoteResult.set(null);
  }

  buyPolicy() {
    if (!this.quoteResult()) return;
    this.isLoading.set(true);

    const payload = this.quoteForm.value;

    this.customerService.requestPolicy(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastr.success('Your policy request has been submitted successfully for Agent review.');
        this.router.navigate(['/customer']);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Error submitting policy request.');
      }
    });
  }
}
