import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../customer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, ShieldCheck, DollarSign, User, ArrowRight, Eye, Download, Shield, Users } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { DocumentService } from '../../../core/services/document.service';

import { PaymentModalComponent } from '../../../shared/components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-customer-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, LucideAngularModule, PaymentModalComponent],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading policies..."></app-loading-spinner>
    <app-payment-modal
      [show]="showPaymentModal()"
      [amount]="selectedPolicy()?.premium || selectedPolicy()?.monthlyPremium || 0"
      [quoteId]="selectedPolicy()?.id || 0"
      (close)="showPaymentModal.set(false)"
      (success)="onPaymentSuccess($event)">
    </app-payment-modal>

    <div class="max-w-7xl mx-auto">
      <div class="mb-12 text-center md:text-left">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Policies</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg">
          View and manage all your active insurance policies in one place.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        @for (policy of activePolicies(); track policy.id) {
          <div class="group relative bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-blue-500/5 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
            <!-- Dynamic Gradient Background Based on Status -->
             <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div class="p-10 relative z-10 flex flex-col h-full">
              <!-- Header with Plan Name & Status -->
              <div class="flex justify-between items-start mb-10">
                <div class="flex items-center gap-4">
                  <div class="p-3.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                    <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">{{ policy.planName || 'Standard Package' }}</h3>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Policy ID: #{{ policy.id }}</p>
                  </div>
                </div>
                <span 
                  class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800': policy.status === 'Active',
                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800': policy.status !== 'Active'
                  }"
                >
                  {{ policy.status }}
                </span>
              </div>

              <!-- Main Stats -->
              <div class="mb-10 pb-8 border-b border-slate-50 dark:border-slate-800">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col text-left">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Coverage</span>
                    <span class="text-lg font-black text-slate-900 dark:text-white leading-none whitespace-nowrap">{{ policy.coverageAmount | currency }}</span>
                  </div>
                  <div class="flex flex-col text-right">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Premium</span>
                    <div class="flex items-baseline justify-end gap-1 leading-none">
                      <span class="text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">{{ (policy.premium || policy.monthlyPremium) | currency }}</span>
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">/mo</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Secondary Details -->
              <div class="space-y-4 mb-8 flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <lucide-icon name="user" class="h-4 w-4 text-slate-300"></lucide-icon>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Agent</span>
                  </div>
                  <span class="text-xs font-black text-slate-900 dark:text-white">{{ policy.agentName || 'TBA' }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <lucide-icon name="users" class="h-4 w-4 text-slate-300"></lucide-icon>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Family Size</span>
                  </div>
                  <span class="text-xs font-black text-slate-900 dark:text-white">{{ policy.familySize || 1 }} Members</span>
                </div>
                
                <!-- Waiting Period Tracker (Visible for Active Policies) -->
                @if (policy.status?.toUpperCase() === 'ACTIVE') {
                   <div class="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div class="flex items-center justify-between mb-4">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting Periods</span>
                        <span *ngIf="policy.isPorting" class="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">Ported Benefit</span>
                      </div>
                      
                      <div class="space-y-4">
                        <!-- Surgery Tracker -->
                        <div>
                          <div class="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                            <span class="text-slate-400">Surgery (30 Days)</span>
                            <span [class.text-emerald-500]="getRemainingDays(policy.createdAt, 30, policy.isPorting) === 0" [class.text-blue-500]="getRemainingDays(policy.createdAt, 30, policy.isPorting) > 0">
                              {{ getRemainingDays(policy.createdAt, 30, policy.isPorting) }} days left
                            </span>
                          </div>
                          <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" [style.width.%]="getWaitingPeriodProgress(policy.createdAt, 30, policy.isPorting)"></div>
                          </div>
                        </div>

                        <!-- Maternity Tracker -->
                        <div>
                          <div class="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                            <span class="text-slate-400">Maternity (15 Days)</span>
                            <span [class.text-emerald-500]="getRemainingDays(policy.createdAt, 15, policy.isPorting) === 0" [class.text-blue-500]="getRemainingDays(policy.createdAt, 15, policy.isPorting) > 0">
                              {{ getRemainingDays(policy.createdAt, 15, policy.isPorting) }} days left
                            </span>
                          </div>
                          <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" [style.width.%]="getWaitingPeriodProgress(policy.createdAt, 15, policy.isPorting)"></div>
                          </div>
                        </div>

                        <!-- Pre-existing diseases if any -->
                        @if (policy.preExistingConditions) {
                          <div>
                            <div class="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                              <span class="text-slate-400">PED (30 Days)</span>
                              <span [class.text-emerald-500]="getRemainingDays(policy.createdAt, 30, policy.isPorting) === 0" [class.text-amber-500]="getRemainingDays(policy.createdAt, 30, policy.isPorting) > 0">
                                {{ getRemainingDays(policy.createdAt, 30, policy.isPorting) }} days left
                              </span>
                            </div>
                            <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div class="h-full bg-amber-500 rounded-full transition-all duration-1000" [style.width.%]="getWaitingPeriodProgress(policy.createdAt, 30, policy.isPorting)"></div>
                            </div>
                            <p class="text-[8px] font-bold text-slate-400 mt-1 truncate">Conditions: {{ policy.preExistingConditions }}</p>
                          </div>
                        }
                      </div>
                   </div>
                }

                <!-- Invoice Section (Only shown if payment is done) -->
                @if (invoices()[policy.id.toString()] && (policy.status?.toUpperCase() === 'ACTIVE' || policy.status?.toUpperCase() === 'INACTIVE')) {
                  <div class="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Invoice</span>
                    <div class="flex gap-4">
                       <a [href]="getInvoiceViewUrl(invoices()[policy.id.toString()].id)" target="_blank" class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:scale-110 transition-all border border-indigo-100 dark:border-indigo-800">
                          <lucide-icon name="eye" class="h-4 w-4"></lucide-icon>
                       </a>
                       <button (click)="downloadInvoice(invoices()[policy.id.toString()].id, invoices()[policy.id.toString()].fileName)" class="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:scale-110 transition-all border border-emerald-100 dark:border-emerald-800">
                          <lucide-icon name="download" class="h-4 w-4"></lucide-icon>
                       </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="grid grid-cols-1 gap-4 mt-auto">
                @if (policy.status === 'Payment Pending' || policy.status === 'PAYMENT PENDING') {
                  <button
                    (click)="openPayment(policy)"
                    class="flex items-center justify-center gap-3 py-4 px-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <lucide-icon name="credit-card" class="h-4 w-4"></lucide-icon>
                    Pay Premium ({{ (policy.premium || policy.monthlyPremium) | currency }})
                  </button>
                } @else {
                  <a [routerLink]="['/customer/claim']" [queryParams]="{ policyId: policy.id }" class="flex items-center justify-center gap-3 py-4 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95">
                    <lucide-icon name="plus-circle" class="h-4 w-4"></lucide-icon>
                    Raise a Claim
                  </a>
                }
              </div>
            </div>

            <!-- Background Decoration -->
            <div class="absolute -bottom-10 -right-10 text-slate-50 dark:text-slate-800/10 opacity-30 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 pointer-events-none z-0">
               <lucide-icon name="shield" class="h-56 w-56"></lucide-icon>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-100/50 dark:shadow-none">
            <div class="relative inline-block mb-10">
               <div class="p-8 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200 dark:text-slate-700">
                  <lucide-icon name="shield-off" class="h-20 w-20"></lucide-icon>
               </div>
               <div class="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400">
                  <lucide-icon name="search" class="h-6 w-6"></lucide-icon>
               </div>
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">No Policies Found</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">You don't have any active insurance policies yet.</p>
            <button [routerLink]="['/customer/quote']" class="mt-10 inline-flex items-center gap-3 py-4 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.05] active:scale-95">
               Get a Quote
               <lucide-icon name="plus" class="h-4 w-4"></lucide-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class CustomerPoliciesComponent implements OnInit {
  private customerService = inject(CustomerService);
  private documentService = inject(DocumentService);
  private toastr = inject(ToastrService);

  policies = signal<any[]>([]);
  invoices = signal<Record<string, any>>({});
  isLoading = signal(false);
  
  showPaymentModal = signal(false);
  selectedPolicy = signal<any | null>(null);
 
  activePolicies = computed(() => {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'PAYMENT PENDING'];
    return this.policies().filter(p => p.status && validStatuses.includes(p.status.toUpperCase()));
  });

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.isLoading.set(true);
    this.customerService.getMyPolicies().subscribe({
      next: (data) => {
        this.policies.set(data || []);
        
        // Fetch invoices ONLY for policies that are fully paid/active
        (data || []).forEach(policy => {
          const status = policy.status?.toUpperCase();
          if (status === 'ACTIVE' || status === 'INACTIVE') {
            this.customerService.getPolicyInvoices(policy.id).subscribe({
              next: (docs) => {
                if (docs && docs.length > 0) {
                  // Find an actual invoice or any policy document if it's active
                  const invoice = docs.find(d => 
                    d.documentType?.toUpperCase().includes('INVOICE') || 
                    d.documentType?.toUpperCase().includes('POLICY')
                  ) || docs[0];
                  
                  if (invoice) {
                    this.invoices.update(prev => ({ 
                      ...prev, 
                      [policy.id.toString()]: invoice 
                    }));
                  }
                }
              }
            });
          }
        });

        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load policies.');
        this.isLoading.set(false);
      }
    });
  }

  getInvoiceViewUrl(id: number): string {
    return this.documentService.getViewUrl(id);
  }

  downloadInvoice(id: number, fileName: string) {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        this.documentService.saveFile(blob, fileName);
      },
      error: () => {
        this.toastr.error('Failed to download invoice.');
      }
    });
  }

  openPayment(policy: any) {
    this.selectedPolicy.set(policy);
    this.showPaymentModal.set(true);
  }

  onPaymentSuccess(event: any) {
    this.loadPolicies();
  }

  getWaitingPeriodProgress(createdAt: string, targetDays: number, isPorted: boolean = false): number {
    if (isPorted) return 100;
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return Math.min(Math.round((diffDays / targetDays) * 100), 100);
  }

  getRemainingDays(createdAt: string, targetDays: number, isPorted: boolean = false): number {
    if (isPorted) return 0;
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return Math.max(targetDays - diffDays, 0);
  }
}
