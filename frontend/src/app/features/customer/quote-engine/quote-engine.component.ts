import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Calculator, Activity, CheckCircle2, Check, Paperclip, X, AlertCircle } from 'lucide-angular';
import { PaymentModalComponent } from '../../../shared/components/payment-modal/payment-modal.component';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-quote-engine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, LucideAngularModule, PaymentModalComponent],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Processing..."></app-loading-spinner>
    <app-payment-modal 
      [show]="showPaymentModal()" 
      [amount]="quoteResult()?.calculatedMonthlyPremium || quoteResult()?.monthlyPremium || 0"
      [age]="quoteForm.value.age || 30"
      [planName]="quoteForm.value.planName || ''"
      [tier]="quoteForm.value.tier || ''"
      (close)="showPaymentModal.set(false)"
      (success)="onPaymentSuccess($event)">
    </app-payment-modal>

    <div class="max-w-3xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Get a Quote</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">
          Fill in your details to get an instant tailored insurance quote.
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <!-- Step 1: Form -->
        @if (!quoteResult()) {
          <div class="p-8">
            <form [formGroup]="quoteForm" (ngSubmit)="calculate()" class="space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                  <input
                    type="number"
                    formControlName="age"
                    min="18"
                    max="100"
                    class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
                  />
                </div>
                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Plan Name</label>
                  <select
                    formControlName="planName"
                    class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none appearance-none"
                  >
                    <option value="" disabled>Select a plan</option>
                    @for (plan of availablePlans(); track plan) {
                       <option [value]="plan">{{ plan }}</option>
                    }
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Coverage Tier</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label
                      class="relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500':
                          quoteForm.get('tier')?.value === 'Silver',
                        'border-slate-200 dark:border-slate-700': quoteForm.get('tier')?.value !== 'Silver',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Silver" class="sr-only" />
                      <span class="block text-sm font-medium text-slate-900 dark:text-white">Silver</span>
                      <span class="block text-sm text-slate-500 dark:text-slate-400 mt-1">Essential coverage.</span>
                    </label>
                    <label
                      class="relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500':
                          quoteForm.get('tier')?.value === 'Gold',
                        'border-slate-200 dark:border-slate-700': quoteForm.get('tier')?.value !== 'Gold',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Gold" class="sr-only" />
                      <span class="block text-sm font-medium text-slate-900 dark:text-white">Gold</span>
                      <span class="block text-sm text-slate-500 dark:text-slate-400 mt-1">Most popular choice.</span>
                    </label>
                    <label
                      class="relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500':
                          quoteForm.get('tier')?.value === 'Platinum',
                        'border-slate-200 dark:border-slate-700': quoteForm.get('tier')?.value !== 'Platinum',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Platinum" class="sr-only" />
                      <span class="block text-sm font-medium text-slate-900 dark:text-white">Platinum</span>
                      <span class="block text-sm text-slate-500 dark:text-slate-400 mt-1">Maximum protection.</span>
                    </label>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Pre-existing Conditions</label
                  >
                  <textarea
                    formControlName="preExistingConditions"
                    rows="3"
                    class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
                    placeholder="None"
                  ></textarea>
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
              class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
            >
              <lucide-icon name="check-circle-2" class="h-8 w-8 text-green-600 dark:text-green-400"></lucide-icon>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Estimated Premium</h2>
            <div class="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">
              {{ (quoteResult().calculatedMonthlyPremium || quoteResult().monthlyPremium) | currency }}
              <span class="text-lg text-slate-500 dark:text-slate-400 font-normal">/mo</span>
            </div>
            <div
              class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 max-w-sm mx-auto mb-8 border border-slate-200 dark:border-slate-700 text-left space-y-3"
            >
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400">Tier Selected</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ quoteResult().tier || quoteResult().selectedTierName }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 dark:text-slate-400">Coverage Amount</span>
                <span class="font-medium text-slate-900 dark:text-white">{{
                  quoteResult().coverageAmount | currency
                }}</span>
              </div>
              @if (isPaid()) {
                <div class="flex items-center justify-center gap-2 py-2 text-green-600 dark:text-green-400 text-sm font-bold">
                  <lucide-icon name="check" class="h-4 w-4"></lucide-icon>
                  Payment Verified
                </div>

                <!-- Document Upload (required before final submission) -->
                <div class="mt-4 text-left border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Documents <span class="text-red-500">*</span></p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Upload your Aadhaar, health reports or other identity/medical documents. The agent must verify all documents before activating your policy.</p>
                  <div class="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
                    <lucide-icon name="alert-circle" class="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                    <p class="text-xs text-amber-700 dark:text-amber-300">If any document is rejected by the agent, your policy will be automatically rejected.</p>
                  </div>
                  <div class="flex gap-2 mb-2">
                    <select #policyDocType class="rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white py-1.5 px-2 text-xs outline-none">
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="HealthReport">Health Report</option>
                      <option value="IncomeCertificate">Income Certificate</option>
                      <option value="Photo">Photograph</option>
                      <option value="Other">Other</option>
                    </select>
                    <label class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-blue-400 transition-colors text-xs text-slate-500 hover:text-blue-500">
                      <lucide-icon name="paperclip" class="h-3.5 w-3.5"></lucide-icon>
                      Choose file
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" (change)="addFile($event, policyDocType.value)">
                    </label>
                  </div>
                  @if (attachedFiles().length > 0) {
                    <ul class="space-y-1">
                      @for (f of attachedFiles(); track f.name) {
                        <li class="flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 text-xs">
                          <span class="truncate text-slate-700 dark:text-slate-300">{{ f.file.name }} <span class="text-slate-400">({{ f.docType }})</span></span>
                          <button type="button" (click)="removeFile(f.name)" class="text-red-400 hover:text-red-600 ml-2">
                            <lucide-icon name="x" class="h-3.5 w-3.5"></lucide-icon>
                          </button>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="text-xs text-slate-400 italic">No documents attached yet.</p>
                  }
                </div>
              }
            </div>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <button
                (click)="resetForm()"
                class="px-6 py-2.5 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors"
              >
                Recalculate
              </button>
              
              @if (!isPaid()) {
                <button
                  (click)="showPaymentModal.set(true)"
                  class="px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors"
                >
                  Confirm &amp; Pay {{ (quoteResult().calculatedMonthlyPremium || quoteResult().monthlyPremium) | currency }}
                </button>
              } @else {
                <button
                  (click)="buyPolicy()"
                  [disabled]="attachedFiles().length === 0 || isLoading()"
                  class="px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
                >
                  {{ attachedFiles().length === 0 ? 'Upload documents first' : 'Final Request for Policy' }}
                </button>
              }
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

  private docService = inject(DocumentService);
  isLoading = signal(false);
  quoteResult = signal<any | null>(null);
  availablePlans = signal<string[]>([]);

  showPaymentModal = signal(false);
  isPaid = signal(false);
  quoteId = signal<number>(0);

  // Documents to attach to this policy application
  attachedFiles = signal<{ name: string; file: File; docType: string }[]>([]);

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
          this.quoteId.set(res.id);
          this.isPaid.set(res.isPaid || false);
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

  onPaymentSuccess(event: any) {
    // The backend creates the PremiumQuote record during payment and returns its ID
    if (event?.quoteId) {
      this.quoteId.set(event.quoteId);
    }
    this.isPaid.set(true);
  }

  resetForm() {
    this.quoteResult.set(null);
    this.isPaid.set(false);
    this.quoteId.set(0);
  }

  addFile(event: Event, docType: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const key = `${file.name}_${docType}`;
    this.attachedFiles.update(list => [...list, { name: key, file, docType }]);
    input.value = '';
  }

  removeFile(name: string) {
    this.attachedFiles.update(list => list.filter(f => f.name !== name));
  }

  buyPolicy() {
    if (!this.quoteResult()) return;
    if (this.attachedFiles().length === 0) {
      this.toastr.error('Please upload at least one document before submitting the policy request.');
      return;
    }
    this.isLoading.set(true);

    const qId = this.quoteId();
    const files = this.attachedFiles();

    // Validate the existing paid quote — no new DB record is created
    this.customerService.requestPolicy({ quoteId: qId }).subscribe({
      next: () => {
        // Upload documents sequentially, linked to the PremiumQuote (Policy)
        let failed = 0;
        const doUpload = (index: number) => {
          if (index >= files.length) {
            this.isLoading.set(false);
            if (failed > 0) {
              this.toastr.warning('Policy requested, but some documents failed to upload.');
            } else {
              this.toastr.success('Policy request submitted! Agent will review your documents.');
            }
            this.router.navigate(['/customer']);
            return;
          }
          const f = files[index];
          this.docService.uploadForEntity(f.file, f.docType, 'Policy', qId).subscribe({
            next: () => doUpload(index + 1),
            error: () => { failed++; doUpload(index + 1); }
          });
        };
        doUpload(0);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastr.error('Error submitting policy request.');
      }
    });
  }
}
