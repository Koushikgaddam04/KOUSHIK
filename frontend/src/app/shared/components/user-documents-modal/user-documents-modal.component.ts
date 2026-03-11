import { Component, EventEmitter, Input, Output, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { LucideAngularModule, X, FileText, Download, Eye } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-documents-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" *ngIf="show">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" (click)="onClose()">
          <div class="absolute inset-0 bg-slate-900 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <lucide-icon name="file-text" class="h-6 w-6 text-emerald-600"></lucide-icon>
                Customer Documents
              </h3>
              <button (click)="onClose()" class="text-slate-400 hover:text-slate-500 transition-colors">
                <lucide-icon name="x" class="h-5 w-5"></lucide-icon>
              </button>
            </div>

            @if (isLoading()) {
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            } @else {
              <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                @if (documents().length === 0) {
                  <div class="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <lucide-icon name="file-text" class="h-12 w-12 mx-auto mb-3 opacity-20"></lucide-icon>
                    <p>No documents found for this user.</p>
                  </div>
                }

                @for (doc of documents(); track doc.id) {
                  <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                    <div class="flex items-center gap-4">
                      <div class="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                        <lucide-icon name="file-text" class="h-6 w-6"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ doc.fileName }}</p>
                        <div class="flex items-center gap-2 mt-1">
                           <span class="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-tighter">{{ doc.documentType }}</span>
                           <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                           <span class="text-[10px] font-medium" [ngClass]="{
                             'text-yellow-600': doc.status === 'Pending',
                             'text-green-600': doc.status === 'Verified',
                             'text-red-600': doc.status === 'Rejected'
                           }">{{ doc.status }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <a 
                        [href]="getViewUrl(doc.id)" 
                        target="_blank"
                        class="px-4 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                      >
                        <lucide-icon name="eye" class="h-4 w-4"></lucide-icon>
                        View Inline
                      </a>
                    </div>
                  </div>
                }
              </div>
            }

            <div class="mt-8 flex justify-end">
              <button
                (click)="onClose()"
                class="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserDocumentsModalComponent implements OnChanges {
  @Input() show = false;
  @Input() userId = 0;
  @Output() close = new EventEmitter<void>();

  private docService = inject(DocumentService);
  private toastr = inject(ToastrService);

  documents = signal<any[]>([]);
  isLoading = signal(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show']?.currentValue && this.userId) {
      this.loadDocuments();
    }
  }

  loadDocuments() {
    this.isLoading.set(true);
    this.docService.getUserDocuments(this.userId).subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load user documents');
        this.isLoading.set(false);
      }
    });
  }

  onClose() {
    this.close.emit();
  }


  getViewUrl(id: number) {
    return this.docService.getViewUrl(id);
  }
}
