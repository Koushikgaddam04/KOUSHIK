import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../officer.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LucideAngularModule, Check, X, FileText, Search, Eye, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-angular';
import { DocumentService } from '../../../core/services/document.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-claims-queue',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent, LucideAngularModule],
  template: `

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Claims Queue</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Verify supporting documents, then approve or reject each claim.</p>
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
      <div class="space-y-4 mt-4">
        @for (_ of [1,2,3]; track $index) {
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/5"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
              </div>
              <div class="flex gap-2">
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        }
      </div>
    }

    @if (!listLoading()) {
    <div class="mb-4">
      <div class="relative w-72">
        <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></lucide-icon>
        <input type="text" placeholder="Search claims..." (input)="onSearch($event)"
          class="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white" />
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
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <!-- Claim row -->
          <div class="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-4 min-w-0">
              <div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <lucide-icon name="shield-alert" class="h-5 w-5 text-orange-500"></lucide-icon>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white">
                  Claim #{{ claim.id }}
                  <span class="text-xs font-medium text-slate-400 ml-1">· Policy #{{ claim.policyId }}</span>
                </p>
                <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ claim.amount | currency }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">{{ claim.reason }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Expand docs toggle -->
              <button
                (click)="toggleDocs(claim.id)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-medium rounded text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <lucide-icon name="file-text" class="h-3.5 w-3.5"></lucide-icon>
                Docs ({{ docCount(claim.id) }})
                <lucide-icon [name]="expandedClaim() === claim.id ? 'chevron-up' : 'chevron-down'" class="h-3.5 w-3.5"></lucide-icon>
              </button>

              <button (click)="approve(claim.id)"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-3.5 w-3.5 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="check" class="h-3.5 w-3.5"></lucide-icon>
                }
                Approve
              </button>
              <button (click)="openRejectModal(claim.id)"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-3.5 w-3.5 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="x" class="h-3.5 w-3.5"></lucide-icon>
                }
                Reject
              </button>
            </div>
          </div>

          <!-- Inline documents panel -->
          @if (expandedClaim() === claim.id) {
            <div class="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
              <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Supporting Documents</h3>
              @if (docsLoading()) {
                <div class="flex items-center gap-2 text-xs text-slate-400 py-4">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  Loading documents...
                </div>
              } @else if (entityDocs().length === 0) {
                <div class="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                  <lucide-icon name="alert-triangle" class="h-4 w-4 flex-shrink-0"></lucide-icon>
                  No documents uploaded for this claim. You cannot approve a claim without verified documents.
                </div>
              } @else {
                <div class="space-y-2">
                  @for (doc of entityDocs(); track doc.id) {
                    <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div class="flex items-center gap-3 min-w-0">
                        <lucide-icon name="file-text" class="h-5 w-5 text-orange-400 flex-shrink-0"></lucide-icon>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ doc.fileName }}</p>
                          <p class="text-xs text-slate-400">{{ doc.documentType }}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 flex-shrink-0">
                        <!-- Status badge -->
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400': doc.status === 'Pending',
                            'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400': doc.status === 'Verified',
                            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400': doc.status === 'Rejected'
                          }">
                          {{ doc.status }}
                        </span>

                        <!-- View inline -->
                        <a [href]="getViewUrl(doc.filePath)" target="_blank"
                          class="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                          <lucide-icon name="eye" class="h-3.5 w-3.5"></lucide-icon>
                          View
                        </a>

                        <!-- Verify / Reject doc -->
                        @if (doc.status === 'Pending') {
                          <button (click)="reviewDoc(doc.id, 'Verified')"
                            class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            ✓ Verify
                          </button>
                          <button (click)="reviewDoc(doc.id, 'Rejected')"
                            class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            ✕ Reject
                          </button>
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
    if (this.expandedClaim() === claimId) { this.expandedClaim.set(null); return; }
    this.expandedClaim.set(claimId);
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

  getViewUrl(filePath: string): string {
    return this.docService.getViewUrl(filePath);
  }
}
