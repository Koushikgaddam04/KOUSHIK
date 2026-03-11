import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Search, FileCheck, Check, X, Eye, AlertCircle } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule, FormsModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Processing Review..."></app-loading-spinner>
    
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Verification Queue</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Authenticating mandatory customer documents for policy activation.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div class="relative w-full md:w-80 group">
          <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"></lucide-icon>
          <input
            type="text"
            placeholder="Search by file or user ID..."
            [(ngModel)]="searchTerm"
            class="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div class="flex items-center gap-2">
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              Pending Items: {{ filteredDocs().length }}
           </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Doc ID</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Customer</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">File Asset</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Admin Feedback</th>
              <th scope="col" class="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            @if (filteredDocs().length === 0) {
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <div class="flex flex-col items-center">
                    <lucide-icon name="file-check" class="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3"></lucide-icon>
                    <p class="text-lg font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p class="text-sm">There are no pending documents to verify.</p>
                  </div>
                </td>
              </tr>
            }

            @for (doc of filteredDocs(); track doc.id) {
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                <td class="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-slate-500 dark:text-slate-400">#{{ doc.id }}</td>
                <td class="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">Customer #{{ doc.uploadedByUserId }}</td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800">
                    {{ doc.documentType }}
                  </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-sm">
                  <a [href]="view(doc.id)" target="_blank" class="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    <lucide-icon name="eye" class="h-4 w-4"></lucide-icon>
                    {{ doc.fileName }}
                  </a>
                </td>
                <td class="px-6 py-5">
                  <input
                    type="text"
                    [(ngModel)]="docComments[doc.id]"
                    placeholder="Approving as valid..."
                    class="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white dark:placeholder:text-slate-600"
                  />
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-right space-x-2">
                  <button
                    (click)="review(doc.id, 'Verified')"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    <lucide-icon name="check" class="mr-1.5 h-4 w-4"></lucide-icon>
                    Approve
                  </button>
                  <button
                    (click)="review(doc.id, 'Rejected')"
                    class="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-all active:scale-95"
                  >
                    <lucide-icon name="x" class="mr-1.5 h-4 w-4"></lucide-icon>
                    Decline
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class DocumentVerificationComponent implements OnInit {
  private docService = inject(DocumentService);
  private toastr = inject(ToastrService);

  pendingDocs = signal<any[]>([]);
  searchTerm = '';
  isLoading = signal(false);
  docComments: { [id: number]: string } = {};

  ngOnInit() {
    this.loadDocs();
  }

  loadDocs() {
    this.isLoading.set(true);
    this.docService.getPendingDocuments().subscribe({
      next: (res) => {
        this.pendingDocs.set(res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load pending documents.');
        this.isLoading.set(false);
      }
    });
  }

  filteredDocs() {
    const term = this.searchTerm.toLowerCase();
    return this.pendingDocs().filter(d =>
      d.fileName.toLowerCase().includes(term) ||
      d.documentType.toLowerCase().includes(term) ||
      d.uploadedByUserId.toString().includes(term)
    );
  }

  view(id: number): string {
    return this.docService.getViewUrl(id);
  }

  review(id: number, status: string) {
    const comments = this.docComments[id] || (status === 'Verified' ? 'Approved as valid' : 'Rejected');

    this.isLoading.set(true);
    this.docService.reviewDocument(id, status, comments).subscribe({
      next: (res) => {
        this.toastr.success(res.Message || `Document ${status} successfully.`);
        this.loadDocs();
      },
      error: (err) => {
        const msg = err.error?.Message || 'Verification failed.';
        this.toastr.error(msg);
        this.isLoading.set(false);
      }
    });
  }
}
