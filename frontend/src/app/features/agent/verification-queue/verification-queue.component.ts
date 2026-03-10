import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, CheckCircle, Search, ClipboardList, Eye, XCircle, ChevronDown, ChevronUp, FileText, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-angular';
import { DocumentService } from '../../../core/services/document.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-verification-queue',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Verification Queue</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Review customer documents, then verify or reject each policy.</p>
    </div>

    <!-- Inline skeleton while list is loading -->
    @if (listLoading()) {
      <div class="space-y-4">
        @for (_ of [1,2,3]; track $index) {
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
              <div class="flex gap-2">
                <div class="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        }
      </div>
    }

    @if (!listLoading()) {
    <div class="space-y-4">
      @if (queue().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 py-16 text-center">
          <lucide-icon name="clipboard-list" class="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3"></lucide-icon>
          <p class="text-lg font-medium text-slate-700 dark:text-slate-300">Queue is empty</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">No pending policies to verify right now.</p>
        </div>
      }

      @for (item of queue(); track item.id) {
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <!-- Policy row -->
          <div class="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-4 min-w-0">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <lucide-icon name="shield-check" class="h-5 w-5 text-blue-600 dark:text-blue-400"></lucide-icon>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ item.customerName }} <span class="text-xs font-normal text-slate-400">({{ item.customerEmail }})</span></p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.planName }} · {{ item.tier }} Tier · Submitted {{ item.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Expand/collapse docs -->
              <button
                (click)="toggleDocs(item.id)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-medium rounded text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <lucide-icon name="file-text" class="h-3.5 w-3.5"></lucide-icon>
                Docs ({{ docCount(item.id) }})
                <lucide-icon [name]="expandedPolicy() === item.id ? 'chevron-up' : 'chevron-down'" class="h-3.5 w-3.5"></lucide-icon>
              </button>

              <button
                (click)="verify(item.id, 'reject')"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 dark:border-red-700 text-xs font-medium rounded text-red-700 dark:text-red-400 bg-white dark:bg-slate-800 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-3.5 w-3.5 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="x-circle" class="h-3.5 w-3.5"></lucide-icon>
                }
                Reject
              </button>
              <button
                (click)="verify(item.id, 'approve')"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-3.5 w-3.5 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="check-circle" class="h-3.5 w-3.5"></lucide-icon>
                }
                Verify Policy
              </button>
            </div>
          </div>

          <!-- Inline documents panel -->
          @if (expandedPolicy() === item.id) {
            <div class="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
              <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Supporting Documents</h3>
              @if (docsLoading()) {
                <div class="flex items-center gap-2 text-xs text-slate-400 py-4">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  Loading documents...
                </div>
              } @else if (entityDocs().length === 0) {
                <div class="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                  <lucide-icon name="alert-triangle" class="h-4 w-4 flex-shrink-0"></lucide-icon>
                  No documents uploaded yet. Customer has not uploaded any supporting documents for this policy.
                </div>
              } @else {
                <div class="space-y-2">
                  @for (doc of entityDocs(); track doc.id) {
                    <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div class="flex items-center gap-3 min-w-0">
                        <lucide-icon name="file-text" class="h-5 w-5 text-blue-400 flex-shrink-0"></lucide-icon>
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
export class VerificationQueueComponent implements OnInit, OnDestroy {
  private agentService = inject(AgentService);
  private docService = inject(DocumentService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private cdRef = inject(ChangeDetectorRef);

  private routerSub?: Subscription;

  queue = signal<any[]>([]);
  listLoading = signal(false);   // skeleton for list
  actionLoading = signal(false); // spinner on buttons during verify/reject
  expandedPolicy = signal<number | null>(null);
  entityDocs = signal<any[]>([]);
  docsLoading = signal(false);

  // Track doc count per policy id (loaded lazily)
  private docCounts: Record<number, number> = {};

  // Keep isLoading as a no-op alias so old references don't break
  get isLoading() { return this.actionLoading; }

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

  loadQueue() {
    this.listLoading.set(true);
    this.queue.set([]);  // Clear stale data immediately so skeleton shows cleanly
    this.agentService.getVerificationQueue().subscribe({
      next: (res) => {
        this.queue.set(res || []);
        this.listLoading.set(false);
        // Force a second rendering pass so LucideAngular finishes initializing
        // all SVG icons for every card in the list (not just the first one)
        this.cdRef.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load pending policies.');
        this.listLoading.set(false);
      },
    });
  }

  toggleDocs(policyId: number) {
    if (this.expandedPolicy() === policyId) {
      this.expandedPolicy.set(null);
      return;
    }
    this.expandedPolicy.set(policyId);
    this.docsLoading.set(true);
    this.entityDocs.set([]);
    this.docService.getForEntity('Policy', policyId).subscribe({
      next: (docs) => {
        this.entityDocs.set(docs || []);
        this.docCounts[policyId] = docs?.length ?? 0;
        this.docsLoading.set(false);
      },
      error: () => {
        this.docsLoading.set(false);
        this.toastr.error('Failed to load documents.');
      }
    });
  }

  docCount(policyId: number): number {
    return this.docCounts[policyId] ?? '?';
  }

  reviewDoc(docId: number, status: 'Verified' | 'Rejected') {
    this.docService.reviewDocument(docId, status, '').subscribe({
      next: () => {
        this.entityDocs.update(docs =>
          docs.map(d => d.id === docId ? { ...d, status } : d)
        );
        if (status === 'Rejected') {
          this.toastr.warning(`Document rejected. The policy will be automatically rejected when you click "Verify Policy".`);
        } else {
          this.toastr.success('Document verified.');
        }
      },
      error: () => this.toastr.error('Failed to update document status.')
    });
  }

  verify(id: number, status: string = 'approve') {
    this.actionLoading.set(true);
    this.agentService.verifyPolicy(id.toString(), status).subscribe({
      next: (res: any) => {
        this.toastr.success(res || 'Action completed successfully.');
        this.expandedPolicy.set(null);
        this.actionLoading.set(false);
        this.loadQueue();
      },
      error: (err) => {
        const msg = err?.error?.Message || err?.error?.message || 'Operation failed.';
        this.toastr.error(msg);
        this.actionLoading.set(false);
      },
    });
  }

  getViewUrl(filePath: string): string {
    return this.docService.getViewUrl(filePath);
  }
}
