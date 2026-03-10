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
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Submit a New Claim</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Provide details of your incident and upload supporting documents.
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
          <div class="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg text-orange-600 dark:text-orange-400">
            <lucide-icon name="file-text" class="h-5 w-5"></lucide-icon>
          </div>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Claim Information</h2>
        </div>

        <form class="p-6 space-y-5" [formGroup]="claimForm" (ngSubmit)="onSubmit()">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Policy ID</label>
            <input
              type="text"
              formControlName="policyId"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              [readonly]="isPolicyIdPreFilled()"
              [ngClass]="{ 'bg-slate-50 dark:bg-slate-700 cursor-not-allowed': isPolicyIdPreFilled() }"
              [placeholder]="isPolicyIdPreFilled() ? 'Selecting policy...' : 'Enter Policy ID'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Claim Amount ($)</label>
            <input
              type="number"
              formControlName="amount"
              min="1"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              placeholder="e.g. 1500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Claim</label>
            <textarea
              formControlName="reason"
              rows="4"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              placeholder="Detailed description of the incident..."
            ></textarea>
          </div>

          <!-- Document Upload Section -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Supporting Documents <span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Upload hospital bills, prescriptions, medical reports or any relevant documents.
              <strong>The claims officer must verify all documents before your claim can be approved.</strong>
            </p>

            <!-- Info banner -->
            <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
              <lucide-icon name="alert-circle" class="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-xs text-amber-700 dark:text-amber-300">
                If any uploaded document is rejected by the officer, your entire claim will be automatically rejected. Ensure all documents are clear and valid.
              </p>
            </div>

            <!-- File picker -->
            <div class="flex gap-2 mb-3">
              <select #docTypeSelect class="rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white py-2 px-3 text-sm outline-none focus:border-blue-500">
                <option value="HospitalBill">Hospital Bill</option>
                <option value="Prescription">Prescription</option>
                <option value="MedicalReport">Medical Report</option>
                <option value="DischargeSummary">Discharge Summary</option>
                <option value="Other">Other</option>
              </select>
              <label class="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500">
                <lucide-icon name="paperclip" class="h-4 w-4"></lucide-icon>
                Choose file
                <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" (change)="addFile($event, docTypeSelect.value)">
              </label>
            </div>

            <!-- Attached files list -->
            @if (attachedFiles().length > 0) {
              <ul class="space-y-2">
                @for (f of attachedFiles(); track f.name) {
                  <li class="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                    <div class="flex items-center gap-2 min-w-0">
                      <lucide-icon name="file-text" class="h-4 w-4 text-blue-500 flex-shrink-0"></lucide-icon>
                      <span class="truncate text-slate-700 dark:text-slate-300 font-medium">{{ f.file.name }}</span>
                      <span class="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0">{{ f.docType }}</span>
                    </div>
                    <button type="button" (click)="removeFile(f.name)" class="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                      <lucide-icon name="x" class="h-4 w-4"></lucide-icon>
                    </button>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-xs text-slate-400 dark:text-slate-500 italic">No documents attached yet.</p>
            }
          </div>

          <div class="pt-4 flex justify-end">
            <button
              type="submit"
              [disabled]="claimForm.invalid || isLoading() || attachedFiles().length === 0"
              class="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none disabled:opacity-50 transition-colors"
            >
              <lucide-icon name="upload-cloud" class="mr-2 h-4 w-4"></lucide-icon>
              Submit Claim
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
