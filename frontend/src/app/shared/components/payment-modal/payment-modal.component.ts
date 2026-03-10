import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, CreditCard, Lock } from 'lucide-angular';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-payment-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" *ngIf="show">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" (click)="onClose()">
          <div class="absolute inset-0 bg-slate-900 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <lucide-icon name="credit-card" class="h-6 w-6 text-blue-600"></lucide-icon>
                Payment Details
              </h3>
              <button (click)="onClose()" class="text-slate-400 hover:text-slate-500 transition-colors">
                <lucide-icon name="x" class="h-5 w-5"></lucide-icon>
              </button>
            </div>

            <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
               <div class="flex justify-between text-sm mb-1">
                 <span class="text-blue-700 dark:text-blue-300">Amount to Pay</span>
                 <span class="font-bold text-blue-800 dark:text-blue-200">{{ amount | currency }}</span>
               </div>
               <p class="text-xs text-blue-600 dark:text-blue-400">This is your first month's premium to activate the application.</p>
            </div>

            <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  formControlName="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    formControlName="expiryDate"
                    placeholder="MM/YY"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    formControlName="cvv"
                    placeholder="***"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  [disabled]="paymentForm.invalid || isProcessing()"
                  class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  @if (isProcessing()) {
                    <lucide-icon name="lock" class="h-4 w-4 animate-pulse"></lucide-icon>
                    Processing...
                  } @else {
                    Pay {{ amount | currency }} Now
                  }
                </button>
              </div>
            </form>

            <p class="mt-4 text-center text-xs text-slate-500">
               Your payment is secured with 256-bit encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentModalComponent {
    @Input() show = false;
    @Input() amount = 0;
    // Quote details needed by the backend to create the PremiumQuote record during payment.
    // (No DB record exists yet at this point — the Calculate step is purely transient.)
    @Input() age: number = 30;
    @Input() planName: string = '';
    @Input() tier: string = '';
    @Output() close = new EventEmitter<void>();
    /** Emits the full server response including quoteId, quoteReference, and transactionRef */
    @Output() success = new EventEmitter<any>();

    private fb = inject(FormBuilder);
    private paymentService = inject(PaymentService);
    private toastr = inject(ToastrService);

    isProcessing = signal(false);

    paymentForm = this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{16,19}$/)]],
        expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.paymentForm.valid) {
            this.isProcessing.set(true);
            // Pass quote details so the backend can create the PremiumQuote + Payment in one shot
            const payload = {
                ...this.paymentForm.value,
                age: this.age,
                planName: this.planName,
                tier: this.tier
            };

            this.paymentService.processPayment(payload).subscribe({
                next: (res) => {
                    this.isProcessing.set(false);
                    this.toastr.success('Payment Successful!');
                    // res contains { quoteId, quoteReference, transactionRef, message }
                    this.success.emit(res);
                    this.onClose();
                },
                error: (err) => {
                    this.isProcessing.set(false);
                    this.toastr.error('Payment failed. Please try again.');
                }
            });
        }
    }
}
