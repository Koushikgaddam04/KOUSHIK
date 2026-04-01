import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../officer.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LucideAngularModule, Check, X, FileText, Search, Eye, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert, Loader2, Zap, ShieldCheck } from 'lucide-angular';
import { DocumentService } from '../../../core/services/document.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-claims-queue',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent, LucideAngularModule],
  template: `

    <div class="mb-10">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Authentication Pipeline</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Verify claim eligibility through dossiers and evidentiary supporting documents.</p>
    </div>

    <!-- Reject Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="showRejectModal()"
      title="Reject Claim"
      message="Are you sure you want to reject this claim?"
      confirmText="Reject Claim"
      (confirm)="confirmReject()"
      (close)="closeModal()"
    ></app-confirmation-modal>

    <!-- Inline skeleton while list loads -->
    @if (listLoading()) {
      <div class="space-y-6 mt-4">
        @for (_ of [1,2,3]; track $index) {
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 animate-pulse">
            <div class="flex items-center gap-6">
              <div class="h-14 w-14 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              <div class="flex-1 space-y-3">
                <div class="h-5 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
              </div>
              <div class="flex gap-3">
                <div class="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div class="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        }
      </div>
    }

    @if (!listLoading()) {
    <div class="mb-10">
      <div class="relative w-full max-w-md group">
        <lucide-icon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></lucide-icon>
        <input type="text" placeholder="Filter by Claim ID, Policy, or Reason..." (input)="onSearch($event)"
          class="pl-12 pr-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:text-white" />
      </div>
    </div>

    <div class="space-y-4">
      @if (filteredQueue().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 py-16 text-center">
          <lucide-icon name="file-text" class="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3"></lucide-icon>
          <p class="text-lg font-medium text-slate-700 dark:text-slate-300">No Pending Claims</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">You've caught up on all the submitted claims.</p>
        </div>
      }

      @for (claim of filteredQueue(); track claim.id) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
          <!-- Claim row -->
          <div class="p-6 md:p-8 flex items-center justify-between gap-8 flex-wrap">
            <div class="flex items-center gap-6 min-w-0">
              <div class="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                <lucide-icon name="shield-alert" class="h-7 w-7 text-orange-600"></lucide-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-3 mb-1">
                   <p class="text-xl font-black text-slate-900 dark:text-white">Claim #{{ claim.id }}</p>
                   <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Policy #{{ claim.policyId }}</span>
                </div>
                <div class="flex items-center gap-3 mb-2">
                   <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ claim.amount | currency }}</p>
                   <span class="text-slate-300 dark:text-slate-700">|</span>
                   <p class="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-sm">{{ claim.reason }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 flex-shrink-0">
              <!-- Expand docs toggle -->
              <button
                (click)="toggleDocs(claim.id)"
                class="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <lucide-icon name="file-text" class="h-4 w-4 text-indigo-500"></lucide-icon>
                Evidence ({{ docCount(claim.id) }})
                <lucide-icon [name]="expandedClaim() === claim.id ? 'chevron-up' : 'chevron-down'" class="h-4 w-4 opacity-40"></lucide-icon>
              </button>

              <button (click)="approve(claim.id)"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-xs font-black rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="check" class="h-4 w-4"></lucide-icon>
                }
                Authorize
              </button>
              <button (click)="openRejectModal(claim.id)"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-xs font-black rounded-2xl text-white bg-rose-600 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-500/20">
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="x" class="h-4 w-4"></lucide-icon>
                }
                Decline
              </button>
            </div>
          </div>

          <!-- Inline documents panel -->
          @if (expandedClaim() === claim.id) {
              <div class="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-8">
                <div class="flex items-center justify-between mb-8">
                   <div>
                      <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Supporting Dossier</h3>
                      <p class="text-xs text-slate-500 font-medium">Verify attached files to authorize financial disbursement.</p>
                   </div>
                   <div class="flex items-center gap-4">
                      <button
                        (click)="onAudit(claim)"
                        [disabled]="docsLoading()"
                        class="inline-flex items-center gap-2 px-5 py-3 border-0 text-xs font-black rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                      >
                         <lucide-icon name="sparkles" class="h-4 w-4"></lucide-icon>
                         Check Compliance
                      </button>
                      <div class="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400">
                         {{ entityDocs().length }} Assets Found
                      </div>
                   </div>
                </div>

                @if (currentAnalysis() && expandedClaim() === claim.id) {
                  <div class="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
                     <div class="flex items-center gap-3 mb-4">
                        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                           <lucide-icon name="sparkles" class="h-5 w-5 text-indigo-600 dark:text-indigo-400"></lucide-icon>
                        </div>
                        <div>
                           <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Vertex AI Insight</h4>
                           <p class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Automated Compliance Review</p>
                        </div>
                     </div>
                     <p class="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{{ currentAnalysis() }}</p>
                  </div>
               }

              @if (docsLoading()) {
                <div class="flex flex-col items-center justify-center py-16 text-slate-400 gap-4">
                  <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                  <p class="text-xs font-bold tracking-widest uppercase">Decentralized Asset Retrieval...</p>
                </div>
              } @else if (entityDocs().length === 0) {
                <div class="flex items-center gap-4 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 text-sm text-amber-700 dark:text-amber-400">
                  <lucide-icon name="alert-triangle" class="h-6 w-6 flex-shrink-0"></lucide-icon>
                  <p class="font-bold">Caution: No evidentiary documentation detected. Claim cannot be authorized without verified assets.</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (doc of entityDocs(); track doc.id) {
                    <div class="group/doc flex items-center justify-between p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all shadow-sm">
                      <div class="flex items-center gap-4 min-w-0">
                        <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 group-hover/doc:text-indigo-500 transition-colors shadow-inner">
                           <lucide-icon name="file-text" class="h-5 w-5"></lucide-icon>
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{{ doc.fileName }}</p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ doc.documentType }}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-3 flex-shrink-0">
                        <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border"
                          [ngClass]="{
                            'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800': doc.status === 'Pending',
                            'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800': doc.status === 'Verified',
                            'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800': doc.status === 'Rejected'
                          }">
                          {{ doc.status }}
                        </span>

                        <a [href]="getViewUrl(doc.id)" target="_blank"
                          class="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                          title="View Evidence">
                          <lucide-icon name="eye" class="h-4 w-4"></lucide-icon>
                        </a>

                        @if (doc.status === 'Pending') {
                          <div class="flex gap-1.5 ml-2 border-l border-slate-100 dark:border-slate-800 pl-4">
                            <button (click)="reviewDoc(doc.id, 'Verified')"
                              class="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20">
                              <lucide-icon name="check" class="h-4 w-4"></lucide-icon>
                            </button>
                            <button (click)="reviewDoc(doc.id, 'Rejected')"
                              class="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all active:scale-90 shadow-lg shadow-rose-500/20">
                              <lucide-icon name="x" class="h-4 w-4"></lucide-icon>
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
    }
  `,
})
export class ClaimsQueueComponent implements OnInit, OnDestroy {
  private officerService = inject(OfficerService);
  private docService = inject(DocumentService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private cdRef = inject(ChangeDetectorRef);

  private routerSub?: Subscription;

  queue = signal<any[]>([]);
  searchTerm = signal('');
  listLoading = signal(false);   // inline skeleton
  actionLoading = signal(false); // button spinner
  expandedClaim = signal<number | null>(null);
  entityDocs = signal<any[]>([]);
  docsLoading = signal(false);
  currentAnalysis = signal<string | null>(null);

  // Alias so template references to isLoading() still work (reject modal spinner)
  get isLoading() { return this.actionLoading; }

  private docCounts: Record<number, number> = {};

  filteredQueue = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.queue();
    if (!term) return all;
    return all.filter(c =>
      c.id.toString().includes(term) ||
      (c.policyId?.toString() ?? '').includes(term) ||
      c.reason.toLowerCase().includes(term)
    );
  });

  showRejectModal = signal(false);
  claimToReject = signal<number | null>(null);

  ngOnInit() {
    this.loadQueue();
    // Reload data on every navigation to this route (handles sidebar re-clicks
    // when Angular reuses the component instance and ngOnInit doesn't re-fire)
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.loadQueue());
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  loadQueue() {
    this.listLoading.set(true);
    this.queue.set([]);  // Clear stale data immediately so skeleton shows cleanly
    this.officerService.getPendingClaims().subscribe({
      next: (res) => {
        this.queue.set(res || []);
        this.listLoading.set(false);
        // Force a second rendering pass so LucideAngular finishes initializing
        // all SVG icons for every card in the list (not just the first one)
        this.cdRef.detectChanges();
      },
      error: () => { this.toastr.error('Failed to load pending claims.'); this.listLoading.set(false); }
    });
  }

  toggleDocs(claimId: number) {
    if (this.expandedClaim() === claimId) { 
      this.expandedClaim.set(null); 
      this.currentAnalysis.set(null);
      return; 
    }
    this.expandedClaim.set(claimId);
    this.currentAnalysis.set(null);
    this.docsLoading.set(true);
    this.entityDocs.set([]);
    this.docService.getForEntity('Claim', claimId).subscribe({
      next: (docs) => {
        this.entityDocs.set(docs || []);
        this.docCounts[claimId] = docs?.length ?? 0;
        this.docsLoading.set(false);
      },
      error: () => { this.docsLoading.set(false); this.toastr.error('Failed to load documents.'); }
    });
  }

  docCount(claimId: number): number | string {
    return this.docCounts[claimId] ?? '?';
  }

  reviewDoc(docId: number, status: 'Verified' | 'Rejected') {
    this.docService.reviewDocument(docId, status, '').subscribe({
      next: () => {
        this.entityDocs.update(docs => docs.map(d => d.id === docId ? { ...d, status } : d));
        if (status === 'Rejected') {
          this.toastr.warning('Document rejected. The claim will be automatically rejected when you click "Approve".');
        } else {
          this.toastr.success('Document verified.');
        }
      },
      error: () => this.toastr.error('Failed to update document status.')
    });
  }

  onAudit(claim: any) {
    this.docsLoading.set(true);
    this.currentAnalysis.set(null);
    this.officerService.checkCompliance({
      policyId: claim.policyId,
      amount: claim.amount,
      reason: claim.reason
    }).subscribe({
      next: (res) => {
        this.currentAnalysis.set(res.analysis);
        this.toastr.success('AI Forensic analysis complete.');
        this.docsLoading.set(false);
      },
      error: () => {
        this.toastr.error('AI analysis failed.');
        this.docsLoading.set(false);
      }
    });
  }

  approve(id: number) {
    this.actionLoading.set(true);
    this.officerService.decideClaim(id.toString(), 'Approved').subscribe({
      next: () => { this.toastr.success('Claim Approved Successfully.'); this.actionLoading.set(false); this.loadQueue(); },
      error: (err) => {
        const msg = err?.error?.Message || err?.error?.message || 'Failed to approve claim.';
        this.toastr.error(msg);
        this.actionLoading.set(false);
        this.loadQueue();
      }
    });
  }

  openRejectModal(id: number) { this.claimToReject.set(id); this.showRejectModal.set(true); }
  closeModal() { this.showRejectModal.set(false); this.claimToReject.set(null); }

  confirmReject() {
    const id = this.claimToReject();
    if (id) {
      this.actionLoading.set(true);
      this.officerService.decideClaim(id.toString(), 'Rejected').subscribe({
        next: () => { this.toastr.success('Claim Rejected.'); this.actionLoading.set(false); this.closeModal(); this.loadQueue(); },
        error: (err) => {
          const msg = err?.error?.Message || err?.error?.message || 'Failed to reject claim.';
          this.toastr.error(msg);
          this.actionLoading.set(false);
          this.closeModal();
        }
      });
    }
  }

  getViewUrl(id: number): string {
    const url = this.docService.getViewUrl(id);
    // If running on some specific base, ensure absolute path
    if (url.startsWith('/')) {
       return window.location.origin + url;
    }
    return url;
  }
}
