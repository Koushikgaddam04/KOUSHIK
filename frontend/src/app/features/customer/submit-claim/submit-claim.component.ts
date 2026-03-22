import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, FileText, UploadCloud, X, Paperclip, AlertCircle } from 'lucide-angular';
import { DocumentService } from '../../../core/services/document.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-submit-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Submitting Claim..."></app-loading-spinner>

    <div class="max-w-2xl mx-auto">
      <div class="mb-10">
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Raise a Claim</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Tell us about your claim and upload any supporting documents.
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div class="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-4">
          <div class="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <lucide-icon name="file-text" class="h-6 w-6"></lucide-icon>
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest text-xs">Claim Details</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Basic information about the incident</p>
          </div>
        </div>

        <form class="p-8 space-y-8" [formGroup]="claimForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Policy Number</label>
              <input
                type="text"
                formControlName="policyId"
                required
                class="block w-full bg-slate-50 dark:bg-slate-950 border-0 border-b-2 border-slate-100 dark:border-slate-800 py-4 px-4 text-slate-900 dark:text-white font-black text-lg focus:ring-0 focus:border-indigo-500 transition-all outline-none rounded-2xl shadow-inner-sm"
                [readonly]="isPolicyIdPreFilled()"
                [ngClass]="{ 'bg-slate-100/50 dark:bg-slate-800/20 cursor-not-allowed text-slate-400': isPolicyIdPreFilled() }"
                [placeholder]="isPolicyIdPreFilled() ? 'Identifying...' : 'Enter Policy ID'"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Claim Amount ($)</label>
              <input
                type="number"
                formControlName="amount"
                min="1"
                required
                class="block w-full bg-slate-50 dark:bg-slate-950 border-0 border-b-2 border-slate-100 dark:border-slate-800 py-4 px-4 text-slate-900 dark:text-white font-black text-lg focus:ring-0 focus:border-indigo-500 transition-all outline-none rounded-2xl shadow-inner-sm"
                placeholder="1000.00"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Reason for Claim</label>
            <textarea
              formControlName="reason"
              rows="4"
              required
              class="block w-full bg-slate-50 dark:bg-slate-950 border-0 border-b-2 border-slate-100 dark:border-slate-800 py-4 px-4 text-slate-900 dark:text-white font-medium focus:ring-0 focus:border-indigo-500 transition-all outline-none rounded-2xl shadow-inner-sm resize-none"
              placeholder="Explain the incident briefly..."
            ></textarea>
          </div>

          <!-- Document Upload Section -->
          <div class="pt-8 border-t border-slate-50 dark:border-slate-800">
            <div class="flex items-center gap-3 mb-6">
               <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <lucide-icon name="upload-cloud" class="h-5 w-5"></lucide-icon>
               </div>
               <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Supporting Documents</h3>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              Please upload clinical documents like Medical Reports, Hospital Receipts, or Discharge Records. 
              <strong class="text-slate-700 dark:text-slate-300">Providing clear documents helps us process your claim faster.</strong>
            </p>

            <!-- Info banner -->
            <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 mb-8">
              <lucide-icon name="alert-circle" class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                Important: Make sure all documents are valid and clearly visible to avoid claim rejection.
              </p>
            </div>

            <!-- File picker -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <select #docTypeSelect class="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white py-4 px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                <option value="HospitalBill">Hospital Ledger</option>
                <option value="Prescription">Prescription Matrix</option>
                <option value="MedicalReport">Medical Analysis</option>
                <option value="DischargeSummary">Final Appraisal</option>
                <option value="Other">Miscellaneous</option>
              </select>
              <label class="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all group">
                <lucide-icon name="paperclip" class="h-4 w-4 text-slate-400 group-hover:text-indigo-500"></lucide-icon>
                <span class="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-500 tracking-widest">Append Artifact</span>
                <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" (change)="addFile($event, docTypeSelect.value)">
              </label>
            </div>

            <!-- Attached files list -->
            @if (attachedFiles().length > 0) {
              <ul class="space-y-3">
                @for (f of attachedFiles(); track f.name) {
                  <li class="flex items-center justify-between px-5 py-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 transition-all group">
                    <div class="flex items-center gap-4 overflow-hidden">
                       <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <lucide-icon name="file-text" class="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform"></lucide-icon>
                       </div>
                       <div class="flex flex-col min-w-0">
                          <span class="truncate text-sm font-black text-slate-900 dark:text-white">{{ f.file.name }}</span>
                          <span class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5">{{ f.docType }}</span>
                       </div>
                    </div>
                    <button type="button" (click)="removeFile(f.name)" class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                      <lucide-icon name="x" class="h-5 w-5"></lucide-icon>
                    </button>
                  </li>
                }
              </ul>
            } @else {
               <div class="py-10 text-center bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Submit atleast one document</p>
               </div>
            }
          </div>

          <div class="pt-6 flex justify-end">
            <button
              type="submit"
              [disabled]="claimForm.invalid || isLoading() || attachedFiles().length === 0"
              class="w-full inline-flex justify-center items-center py-5 px-10 border border-transparent shadow-xl shadow-indigo-500/20 text-xs font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl focus:outline-none disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
            >
              <lucide-icon name="upload-cloud" class="mr-3 h-5 w-5"></lucide-icon>
              {{ attachedFiles().length === 0 ? 'Evidence Missing' : 'Commit Settlement Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class SubmitClaimComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private docService = inject(DocumentService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  isPolicyIdPreFilled = signal(false);

  // { name: string (for dedup), file: File, docType: string }
  attachedFiles = signal<{ name: string; file: File; docType: string }[]>([]);

  claimForm = this.fb.group({
    policyId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    reason: ['', Validators.required],
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['policyId']) {
        this.claimForm.patchValue({ policyId: +params['policyId'] });
        this.isPolicyIdPreFilled.set(true);
      }
    });
  }

  addFile(event: Event, docType: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const key = `${file.name}_${docType}`;
    if (this.attachedFiles().some(f => f.name === key)) {
      this.toastr.warning('This file is already attached.');
      return;
    }
    this.attachedFiles.update(list => [...list, { name: key, file, docType }]);
    input.value = ''; // reset so same file can be added with different type
  }

  removeFile(name: string) {
    this.attachedFiles.update(list => list.filter(f => f.name !== name));
  }

  onSubmit() {
    if (this.claimForm.invalid) return;
    if (this.attachedFiles().length === 0) {
      this.toastr.error('Please attach at least one supporting document before submitting.');
      return;
    }

    this.isLoading.set(true);

    // Step 1: Submit the claim, get back the claimId
    this.customerService.submitClaim(this.claimForm.value).subscribe({
      next: (res: any) => {
        const claimId: number = res.claimId ?? res.id ?? 0;
        if (!claimId) {
          // No id returned — still navigate but skip doc upload
          this.isLoading.set(false);
          this.toastr.success('Claim Submitted Successfully');
          this.router.navigate(['/customer']);
          return;
        }

        // Step 2: Upload all documents linked to this claim
        const files = this.attachedFiles();
        let uploaded = 0;
        let failed = 0;

        const doUpload = (index: number) => {
          if (index >= files.length) {
            this.isLoading.set(false);
            if (failed > 0) {
              this.toastr.warning(`Claim submitted, but ${failed} document(s) failed to upload. Please contact support.`);
            } else {
              this.toastr.success('Claim and documents submitted successfully!');
            }
            this.router.navigate(['/customer']);
            return;
          }
          const f = files[index];
          this.docService.uploadForEntity(f.file, f.docType, 'Claim', claimId).subscribe({
            next: () => { uploaded++; doUpload(index + 1); },
            error: () => { failed++; doUpload(index + 1); }
          });
        };
        doUpload(0);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.Message || err?.error?.message || 'Failed to submit claim.';
        this.toastr.error(msg);
      },
    });
  }
}
