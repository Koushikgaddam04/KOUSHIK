import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, UploadCloud, FileText, CheckCircle, Trash2, Download, Eye, Sparkles } from 'lucide-angular';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Document Vault</h2>
           <p class="text-sm text-slate-500 dark:text-slate-400">Upload identity and medical documents for faster policy verification.</p>
        </div>
        <div class="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
          <lucide-icon name="upload-cloud" class="h-6 w-6"></lucide-icon>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="mb-8 items-center justify-center flex">
        <label class="w-full flex flex-col items-center px-4 py-8 bg-slate-50 dark:bg-slate-800/50 text-blue-600 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <lucide-icon name="upload-cloud" class="h-10 w-10 mb-2"></lucide-icon>
          <span class="text-sm font-medium">Click to upload file</span>
          <span class="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max 5MB)</span>
          <input type="file" class="hidden" (change)="onFileSelected($event)" accept=".pdf,.png,.jpg,.jpeg" />
        </label>
      </div>

      <!-- AI Insight Section -->
      @if (lastAnalysis()) {
        <div class="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div class="flex items-center gap-2 mb-3">
              <lucide-icon name="sparkles" class="h-4 w-4 text-indigo-500"></lucide-icon>
              <h3 class="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">AI Intelligence</h3>
           </div>
           <textarea readonly 
             class="w-full bg-transparent border-0 text-sm font-medium text-slate-600 dark:text-slate-300 focus:ring-0 resize-none h-32 leading-relaxed"
             [value]="lastAnalysis()"></textarea>
           <p class="text-[10px] text-slate-400 mt-2 font-bold italic">Powered by Policy Intelligence</p>
        </div>
      }

      <!-- Documents List -->
      <div class="space-y-3">
        @if (documents().length === 0) {
           <div class="text-center py-8 text-slate-500 italic text-sm">
             No documents uploaded yet.
           </div>
        }
        
        @for (doc of documents(); track doc.id) {
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white dark:bg-slate-800 rounded shadow-sm text-slate-400">
                <lucide-icon name="file-text" class="h-5 w-5"></lucide-icon>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ doc.fileName }}</p>
                <div class="flex gap-2 mt-0.5">
                   <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">{{ doc.documentType }}</span>
                   <span class="text-[10px] px-1.5 py-0.5 rounded-full" [ngClass]="{
                     'bg-yellow-100 text-yellow-700': doc.status === 'Pending',
                     'bg-green-100 text-green-700': doc.status === 'Verified',
                     'bg-red-100 text-red-700': doc.status === 'Rejected'
                   }">{{ doc.status }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
                <a [href]="getViewUrl(doc.id)" target="_blank" class="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="View Document">
                  <lucide-icon name="eye" class="h-4 w-4"></lucide-icon>
                </a>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DocumentUploadComponent implements OnInit {
  private docService = inject(DocumentService);
  private toastr = inject(ToastrService);

  documents = signal<any[]>([]);
  isLoading = signal(false);
  lastAnalysis = signal<string | null>(null);

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.docService.getMyDocuments().subscribe({
      next: (docs) => this.documents.set(docs),
      error: () => this.toastr.error('Failed to load documents')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size exceeds 5MB');
        return;
      }

      this.isLoading.set(true);
      // Ask for doc type simple prompt for now
      const docType = prompt('Enter document type (e.g. Aadhar, Pan, Health Statement):') || 'Other';

      this.docService.upload(file, docType).subscribe({
        next: (res) => {
          this.toastr.success('Document uploaded successfully');
          if (res.aiAnalysis) {
            this.lastAnalysis.set(res.aiAnalysis);
          }
          this.loadDocuments();
          this.isLoading.set(false);
        },
        error: () => {
          this.toastr.error('Upload failed');
          this.isLoading.set(false);
        }
      });
    }
  }


  getViewUrl(id: number) {
    return this.docService.getViewUrl(id);
  }
}
