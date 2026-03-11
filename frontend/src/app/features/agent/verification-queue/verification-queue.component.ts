import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, CheckCircle, Search, ClipboardList, Eye, XCircle, ChevronDown, ChevronUp, FileText, ShieldCheck, AlertTriangle, Loader2, Rocket, Mail, Check, X } from 'lucide-angular';
import { DocumentService } from '../../../core/services/document.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-verification-queue',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Assigned Pipeline</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Authentication backlog for customer policy applications and supporting dossiers.</p>
    </div>

    <!-- Inline skeleton while list is loading -->
    @if (listLoading()) {
      <div class="space-y-6">
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
                <div class="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
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
        <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
          <!-- Policy row -->
          <div class="p-6 md:p-8 flex items-center justify-between gap-6 flex-wrap">
            <div class="flex items-center gap-5 min-w-0">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm border border-blue-100/50 dark:border-blue-800/50">
                <lucide-icon name="shield-check" class="h-6 w-6"></lucide-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-lg font-black text-slate-900 dark:text-white truncate">{{ item.customerName }}</p>
                  <span class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">#{{ item.id }}</span>
                </div>
                <div class="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                   <div class="flex items-center gap-1">
                      <lucide-icon name="mail" class="h-3 w-3"></lucide-icon>
                      {{ item.customerEmail }}
                   </div>
                   <span>•</span>
                   <div class="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                      {{ item.planName }} ({{ item.tier }})
                   </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 flex-shrink-0">
              <!-- Expand/collapse docs -->
              <button
                (click)="toggleDocs(item.id)"
                class="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                <lucide-icon name="file-text" class="h-4 w-4 text-blue-500"></lucide-icon>
                View Assets ({{ docCount(item.id) }})
                <lucide-icon [name]="expandedPolicy() === item.id ? 'chevron-up' : 'chevron-down'" class="h-4 w-4 opacity-50"></lucide-icon>
              </button>

              <button
                (click)="verify(item.id, 'reject')"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-2 px-4 py-2.5 border border-rose-200 dark:border-rose-900/40 text-xs font-black rounded-2xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
              >
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="x-circle" class="h-4 w-4"></lucide-icon>
                }
                Decline
              </button>
              <button
                (click)="verify(item.id, 'approve')"
                [disabled]="actionLoading()"
                class="inline-flex items-center gap-2 px-5 py-2.5 border border-transparent text-xs font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                @if (actionLoading()) {
                  <lucide-icon name="loader-2" class="h-4 w-4 animate-spin"></lucide-icon>
                } @else {
                  <lucide-icon name="check-circle" class="h-4 w-4"></lucide-icon>
                }
                Issue Policy
              </button>
            </div>
          </div>
          <!-- Inline documents panel -->
          @if (expandedPolicy() === item.id) {
            <div class="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-8">
              <div class="flex items-center justify-between mb-6">
                 <div>
                    <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Supporting Assets</h3>
                    <p class="text-xs text-slate-500 font-medium">Verify each document to enable policy issuance.</p>
                 </div>
                 <div class="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400">
                    {{ entityDocs().length }} Files Found
                 </div>
              </div>

              @if (docsLoading()) {
                <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  <p class="text-xs font-bold tracking-widest uppercase">Fetching Remote Assets...</p>
                </div>
              } @else if (entityDocs().length === 0) {
                <div class="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 text-sm text-amber-700 dark:text-amber-400">
                  <lucide-icon name="alert-triangle" class="h-5 w-5 flex-shrink-0"></lucide-icon>
                  <p class="font-medium">The applicant has not attached any supporting documentation for this policy request.</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (doc of entityDocs(); track doc.id) {
                    <div class="group/doc flex items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-sm">
                      <div class="flex items-center gap-4 min-w-0">
                        <div class="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 group-hover/doc:text-blue-500 transition-colors">
                           <lucide-icon name="file-text" class="h-5 w-5"></lucide-icon>
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{{ doc.fileName }}</p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ doc.documentType }}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-3 flex-shrink-0">
                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border"
                          [ngClass]="{
                            'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800': doc.status === 'Pending',
                            'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800': doc.status === 'Verified',
                            'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800': doc.status === 'Rejected'
                          }">
                          {{ doc.status }}
                        </span>

                        <a [href]="getViewUrl(doc.id)" target="_blank"
                          class="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                          title="View Document">
                          <lucide-icon name="eye" class="h-4 w-4"></lucide-icon>
                        </a>

                        @if (doc.status === 'Pending') {
                          <div class="flex gap-1.5 ml-2 border-l border-slate-100 dark:border-slate-800 pl-3">
                            <button (click)="reviewDoc(doc.id, 'Verified')"
                              class="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20">
                              <lucide-icon name="check" class="h-4 w-4"></lucide-icon>
                            </button>
                            <button (click)="reviewDoc(doc.id, 'Rejected')"
                              class="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all active:scale-90 shadow-lg shadow-rose-500/20">
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

  getViewUrl(id: number): string {
    return this.docService.getViewUrl(id);
  }
}
