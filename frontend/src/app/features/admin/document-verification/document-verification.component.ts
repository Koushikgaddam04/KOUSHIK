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
    
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Document Verification</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Review and verify mandatory documents uploaded by customers.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div class="relative w-64">
          <lucide-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></lucide-icon>
          <input
            type="text"
            placeholder="Search documents..."
            [(ngModel)]="searchTerm"
            class="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">File</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason/Comment</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
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
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">#{{ doc.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">User #{{ doc.uploadedByUserId }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {{ doc.documentType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <a [href]="view(doc.filePath)" target="_blank" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 font-medium">
                    <lucide-icon name="eye" class="h-3.5 w-3.5"></lucide-icon>
                    {{ doc.fileName }}
                  </a>
                </td>
                <td class="px-6 py-4">
                  <input
                    type="text"
                    [(ngModel)]="docComments[doc.id]"
                    placeholder="Approving as valid..."
                    class="block w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    (click)="review(doc.id, 'Verified')"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    <lucide-icon name="check" class="mr-1 h-3.5 w-3.5"></lucide-icon>
                    Accept
                  </button>
                  <button
                    (click)="review(doc.id, 'Rejected')"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <lucide-icon name="x" class="mr-1 h-3.5 w-3.5"></lucide-icon>
                    Reject
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

  view(fileName: string): string {
    return this.docService.getViewUrl(fileName);
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
