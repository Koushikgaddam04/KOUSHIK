import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Calculator, Activity, CheckCircle2, Check, Paperclip, X, AlertCircle, ShieldCheck, Shield, ArrowRight, ArrowLeft, Trash2, Upload } from 'lucide-angular';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-quote-engine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Processing..."></app-loading-spinner>

    <div class="max-w-4xl mx-auto">
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financial Blueprinting</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
           Tailored insurance architectural solutions for your global health protection.
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <!-- Step 0: Plan Selection -->
        @if (!selectedPlanForQuote()) {
          <div class="p-10 bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-3xl">
            <div class="text-center mb-12">
              <h2 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 mb-4 tracking-tight">Select Protection Class</h2>
              <p class="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">Coordinate your coverage with premium-grade assets designed for comprehensive security.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
              @for (plan of availablePlans(); track plan.id) {
                <div class="group relative bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
                  <!-- Gradient Accent Top -->
                  <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  
                  <!-- Header Area -->
                  <div class="flex justify-between items-start mb-8 mt-2 relative z-10">
                    <div class="flex items-center gap-4">
                      <div class="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-indigo-100 dark:border-indigo-800">
                        <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
                      </div>
                      <h3 class="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight pr-2">{{ plan.planName }}</h3>
                    </div>
                  </div>

                  <div class="mb-6 inline-flex self-start items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm relative z-10">
                      {{ plan.coverageAmount | currency:'USD':'symbol':'1.0-0' }} CAP
                  </div>
                  
                  <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-1 leading-relaxed font-medium relative z-10">{{ plan.planDescription || 'Strategic protection protocol optimized for high-impact coverage and lifecycle security.' }}</p>
                  
                  <!-- Footer Area -->
                  <div class="mt-auto border-t border-slate-50 dark:border-slate-800 pt-8 flex flex-col gap-6 relative z-10">
                     <div class="flex flex-col">
                       <span class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Monthly Retention</span>
                       <div class="flex items-baseline gap-1 mt-1">
                          <span class="text-4xl font-black text-slate-900 dark:text-white">{{ plan.monthlyPremium | currency }}</span>
                          <span class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">/ mo</span>
                       </div>
                     </div>
                     <button (click)="selectPlan(plan.planName)" class="w-full group/btn inline-flex justify-center items-center py-4 px-6 border border-transparent shadow-lg shadow-blue-500/20 text-xs font-black uppercase tracking-widest text-white bg-blue-600 dark:bg-blue-600 rounded-2xl focus:outline-none transition-all duration-300 hover:bg-blue-700 hover:scale-[1.02] active:scale-95">
                       Configure Plan
                       <lucide-icon name="arrow-right" class="ml-2 h-4 w-4 transform group-hover/btn:translate-x-2 transition-transform"></lucide-icon>
                     </button>
                  </div>

                  <!-- Background decorations -->
                  <div class="absolute -bottom-10 -right-10 text-slate-100/50 dark:text-slate-800/10 opacity-40 group-hover:text-blue-500/10 group-hover:rotate-45 group-hover:scale-125 transition-all duration-700 pointer-events-none z-0">
                    <lucide-icon name="shield" class="h-56 w-56"></lucide-icon>
                  </div>
                </div>
              }
              @if (availablePlans().length === 0) {
                 <div class="col-span-full py-20 text-center text-slate-400 font-bold italic">Registry Clear: No Plans Available</div>
              }
            </div>
          </div>
        } @else {
        
        <div class="p-6 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <button (click)="backToPlans()" class="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center transition-colors">
             <lucide-icon name="arrow-left" class="mr-2 h-4 w-4"></lucide-icon> Plan Inventory
           </button>
           <span class="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 uppercase tracking-widest">{{ selectedPlanForQuote() }}</span>
        </div>

        <!-- Step 1: Form -->
        @if (!quoteResult()) {
          <div class="p-10">
            <form [formGroup]="quoteForm" (ngSubmit)="calculate()" class="space-y-8">
              <div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <label class="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Biological Age</label>
                  <input
                    type="number"
                    formControlName="age"
                    min="18"
                    max="100"
                    class="block w-full bg-slate-50 dark:bg-slate-950 border-0 border-b-2 border-slate-100 dark:border-slate-800 py-4 px-4 text-slate-900 dark:text-white font-black text-lg focus:ring-0 focus:border-blue-500 transition-all outline-none rounded-2xl shadow-inner-sm"
                  />
                </div>
                <div class="sm:col-span-1">
                  <label class="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Plan Identifier</label>
                  <input
                    type="text"
                    formControlName="planName"
                    readonly
                    class="block w-full bg-slate-100/50 dark:bg-slate-800/20 border-0 border-b-2 border-slate-100 dark:border-slate-800 py-4 px-4 text-slate-400 dark:text-slate-500 font-black text-lg cursor-not-allowed rounded-2xl outline-none"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Coverage Strategy</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <label
                      class="relative group border-2 rounded-[24px] p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
                      [ngClass]="{
                        'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5':
                          quoteForm.get('tier')?.value === 'Silver',
                        'border-slate-100 dark:border-slate-800': quoteForm.get('tier')?.value !== 'Silver',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Silver" class="sr-only" />
                      <span class="block text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-widest">Silver</span>
                      <span class="block text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Core Protection.</span>
                    </label>
                    <label
                      class="relative group border-2 rounded-[24px] p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
                      [ngClass]="{
                        'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-lg shadow-indigo-500/5':
                          quoteForm.get('tier')?.value === 'Gold',
                        'border-slate-100 dark:border-slate-800': quoteForm.get('tier')?.value !== 'Gold',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Gold" class="sr-only" />
                      <span class="block text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Gold</span>
                      <span class="block text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Elite Standard.</span>
                    </label>
                    <label
                      class="relative group border-2 rounded-[24px] p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
                      [ngClass]="{
                        'border-purple-500 bg-purple-50/30 dark:bg-purple-900/10 shadow-lg shadow-purple-500/5':
                          quoteForm.get('tier')?.value === 'Platinum',
                        'border-slate-100 dark:border-slate-800': quoteForm.get('tier')?.value !== 'Platinum',
                      }"
                    >
                      <input type="radio" formControlName="tier" value="Platinum" class="sr-only" />
                      <span class="block text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Platinum</span>
                      <span class="block text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Maximum Guard.</span>
                    </label>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Medical History Disclosure</label>
                  <textarea
                    formControlName="preExistingConditions"
                    rows="4"
                    class="block w-full bg-slate-50 dark:bg-slate-950 border-0 border-b-2 border-slate-100 dark:border-slate-800 py-4 px-4 text-slate-900 dark:text-white font-medium focus:ring-0 focus:border-blue-500 transition-all outline-none rounded-2xl shadow-inner-sm resize-none"
                    placeholder="Specify pre-existing conditions or enter 'None'..."
                  ></textarea>
                </div>
              </div>
              <div class="pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  [disabled]="quoteForm.invalid || isLoading()"
                  class="inline-flex justify-center items-center py-4 px-10 border border-transparent shadow-xl shadow-blue-500/20 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl focus:outline-none disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <lucide-icon name="calculator" class="mr-3 h-4 w-4"></lucide-icon>
                  Propagate Financials
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Step 2: Result -->
        @if (quoteResult()) {
          <div class="p-10 text-center">
            <div
              class="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 shadow-lg shadow-emerald-500/10 mb-8"
            >
              <lucide-icon name="check-circle-2" class="h-10 w-10 text-emerald-600 dark:text-emerald-400"></lucide-icon>
            </div>
            <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Financial Retention Projection</h2>
            <p class="text-slate-500 dark:text-slate-400 mb-10 font-medium">Calculated based on actuarial data and protection tier.</p>
            
            <div class="relative inline-block mb-12">
               <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500">
                 {{ (quoteResult().calculatedMonthlyPremium || quoteResult().monthlyPremium) | currency }}
               </div>
               <div class="absolute -right-40 bottom-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Per / Month</div>
            </div>

            <div
              class="bg-slate-50 dark:bg-slate-800/30 rounded-[32px] p-10 max-w-xl mx-auto mb-10 border border-slate-100 dark:border-slate-800 text-left space-y-6 shadow-inner-sm"
            >
              <div class="flex justify-between items-center pb-4 border-b border-white dark:border-slate-800">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage Strategy</span>
                <span class="font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">{{ quoteResult().tier || quoteResult().selectedTierName }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Exposure</span>
                <span class="text-lg font-black text-slate-900 dark:text-white">{{ quoteResult().coverageAmount | currency }}</span>
              </div>

              <!-- Document Upload (required before final submission) -->
                <div class="mt-8 text-left border-t border-slate-200 dark:border-slate-700 pt-8">
                  <div class="flex items-center gap-3 mb-6">
                     <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <lucide-icon name="paperclip" class="h-5 w-5"></lucide-icon>
                     </div>
                     <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Validation Dossier</h4>
                  </div>

                  <p class="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">System verification requires identity and health credentials. Our Security Agents will validate each artifact before activation.</p>
                  
                  <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 mb-8">
                    <lucide-icon name="alert-circle" class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                    <p class="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">Integrity Constraint: Any dossier rejection triggers immediate policy de-authentication.</p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <select #policyDocType class="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white py-3 px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                      <option value="Aadhaar">Aadhaar Credentials</option>
                      <option value="HealthReport">Medical Appraisal</option>
                      <option value="IncomeCertificate">Financial Statement</option>
                      <option value="Photo">Biometric Photo</option>
                      <option value="Other">Miscellaneous</option>
                    </select>
                    <label class="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all group">
                      <lucide-icon name="upload" class="h-4 w-4 text-slate-400 group-hover:text-blue-500"></lucide-icon>
                      <span class="text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-500 tracking-widest">Append Dossier</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" (change)="addFile($event, policyDocType.value)">
                    </label>
                  </div>

                  @if (attachedFiles().length > 0) {
                    <ul class="space-y-3">
                      @for (f of attachedFiles(); track f.name) {
                        <li class="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all group">
                          <div class="flex items-center gap-3 overflow-hidden">
                             <lucide-icon name="file-text" class="h-4 w-4 text-blue-500 flex-shrink-0"></lucide-icon>
                             <div class="flex flex-col min-w-0">
                                <span class="truncate text-xs font-black text-slate-900 dark:text-white">{{ f.file.name }}</span>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ f.docType }}</span>
                             </div>
                          </div>
                          <button type="button" (click)="removeFile(f.name)" class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                            <lucide-icon name="trash-2" class="h-4 w-4"></lucide-icon>
                          </button>
                        </li>
                      }
                    </ul>
                  } @else {
                    <div class="py-8 text-center bg-slate-100/30 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                       <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Registry Vacant</p>
                    </div>
                  }
                </div>
            </div>
            <div class="flex flex-col sm:flex-row justify-center gap-6">
              <button
                (click)="resetForm()"
                class="px-10 py-4 border-2 border-slate-100 dark:border-slate-800 shadow-sm text-[10px] font-black uppercase tracking-widest rounded-2xl text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-all active:scale-95"
              >
                Actuarial Reset
              </button>
              
              <button
                  (click)="buyPolicy()"
                  [disabled]="attachedFiles().length === 0 || isLoading()"
                  class="px-10 py-4 border border-transparent shadow-xl shadow-blue-500/25 text-[10px] font-black uppercase tracking-widest rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {{ attachedFiles().length === 0 ? 'Verification Required' : 'Authorize Activation' }}
              </button>
            </div>
          </div>
        }
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
  availablePlans = signal<any[]>([]);
  selectedPlanForQuote = signal<string | null>(null);

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
    this.customerService.getPolicyPlans().subscribe({
      next: (policies) => {
        this.availablePlans.set(policies || []);
      }
    });
  }

  selectPlan(planName: string) {
    this.selectedPlanForQuote.set(planName);
    this.quoteForm.patchValue({ planName });
  }

  backToPlans() {
    this.selectedPlanForQuote.set(null);
    this.quoteResult.set(null);
    this.quoteForm.reset({ age: 30, tier: 'Gold', preExistingConditions: '', planName: '' });
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

    const files = this.attachedFiles();

    // Call requestPolicy with the form data to calculate and persist the requested policy
    this.customerService.requestPolicy(this.quoteForm.value).subscribe({
      next: (res) => {
        const qId = res.quoteId;

        // Upload documents sequentially, linked to the PremiumQuote (Policy)
        let failed = 0;
        const doUpload = (index: number) => {
          if (index >= files.length) {
            this.isLoading.set(false);
            if (failed > 0) {
              this.toastr.warning('Policy requested, but some documents failed to upload.');
            } else {
              this.toastr.success('Policy request submitted! Agents will review your documents shortly.');
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
