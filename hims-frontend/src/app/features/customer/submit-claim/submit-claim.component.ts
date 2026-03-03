import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, FileText, UploadCloud } from 'lucide-angular';

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
          Provide details of your incident to initiate the claim process.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div class="bg-orange-100 p-2 rounded-lg text-orange-600">
            <lucide-icon name="file-text" class="h-5 w-5"></lucide-icon>
          </div>
          <h2 class="text-lg font-semibold text-slate-800">Claim Information</h2>
        </div>

        <form class="p-6 space-y-5" [formGroup]="claimForm" (ngSubmit)="onSubmit()">
          <div>
            <label class="block text-sm font-medium text-slate-700">Policy ID</label>
            <input
              type="text"
              formControlName="policyId"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              [readonly]="isPolicyIdPreFilled()"
              [ngClass]="{ 'bg-slate-50 cursor-not-allowed': isPolicyIdPreFilled() }"
              [placeholder]="isPolicyIdPreFilled() ? 'Selecting policy...' : 'Enter Policy ID'"
            />
            <p class="mt-1 text-xs text-slate-500">
              Ensure this is the correct policy for your claim.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Claim Amount ($)</label>
            <input
              type="number"
              formControlName="amount"
              min="1"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              placeholder="e.g. 1500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Reason for Claim</label>
            <textarea
              formControlName="reason"
              rows="4"
              required
              class="mt-1 flex-1 block w-full rounded-md border-slate-300 border py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
              placeholder="Detailed description of the incident..."
            ></textarea>
          </div>

          <div class="pt-4 flex justify-end">
            <button
              type="submit"
              [disabled]="claimForm.invalid || isLoading()"
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
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  isPolicyIdPreFilled = signal(false);

  claimForm = this.fb.group({
    policyId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
    reason: ['', Validators.required],
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['policyId']) {
        this.claimForm.patchValue({ policyId: params['policyId'] });
        this.isPolicyIdPreFilled.set(true);
      }
    });

    // If no policyId in query params, ideally we fetch policies and populate a dropdown.
    // Simplifying here to assume query param or pre-fill.
  }

  onSubmit() {
    if (this.claimForm.valid) {
      this.isLoading.set(true);
      this.customerService.submitClaim(this.claimForm.value).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastr.success('Claim Submitted Successfully');
          this.router.navigate(['/customer']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastr.error('Failed to submit claim.');
        },
      });
    }
  }
}

