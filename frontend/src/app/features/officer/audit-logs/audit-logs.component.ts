import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../officer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Search, Clock, Shield, History } from 'lucide-angular';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Logs..."></app-loading-spinner>

    <div class="mb-10">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Operation Register</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Historical audit trail of all claim adjudications and financial decisions.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="relative w-full md:w-96 group">
          <lucide-icon
            name="search"
            class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Reference, ID, or Action..."
            (input)="onSearch($event)"
            class="pl-12 pr-5 py-3.25 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 dark:text-white rounded-2xl text-sm w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>
        <div class="flex items-center gap-3">
           <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              Logged Entries: {{ filteredLogs().length }}
           </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead class="bg-slate-50/50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Register ID</th>
              <th scope="col" class="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Claim Reference</th>
              <th scope="col" class="px-6 py-5 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Decision Status</th>
              <th scope="col" class="px-6 py-5 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            @if (filteredLogs().length === 0) {
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                  <div class="flex flex-col items-center">
                    <lucide-icon name="clock" class="h-10 w-10 text-slate-300 mb-3"></lucide-icon>
                    <p class="text-lg font-medium text-slate-700">No Logs Found</p>
                  </div>
                </td>
              </tr>
            }
            @for (item of filteredLogs(); track item.id) {
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                <td class="px-6 py-6 whitespace-nowrap text-sm font-black text-slate-400 group-hover:text-slate-600 transition-colors">#REG-{{ item.id }}</td>
                <td class="px-6 py-6 whitespace-nowrap">
                   <div class="flex items-center gap-3">
                      <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <lucide-icon name="shield" class="h-4 w-4"></lucide-icon>
                      </div>
                      <span class="text-sm font-black text-slate-800 dark:text-slate-200">{{ item.claimReference || 'Unknown' }}</span>
                   </div>
                </td>
                <td class="px-6 py-6 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800': item.actionTaken === 'Approved',
                      'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800': item.actionTaken === 'Rejected',
                      'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700': item.actionTaken !== 'Approved' && item.actionTaken !== 'Rejected',
                    }"
                  >
                    {{ item.actionTaken || 'Processed' }}
                  </span>
                </td>
                <td class="px-6 py-6 whitespace-nowrap text-right">
                   <div class="text-xs font-black text-slate-700 dark:text-slate-300">{{ (item.dateTime | date: 'MMM d, y') }}</div>
                   <div class="text-[10px] font-bold text-slate-400 mt-0.5">{{ (item.dateTime | date: 'h:mm a') }}</div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AuditLogsComponent implements OnInit {
  private officerService = inject(OfficerService);
  private toastr = inject(ToastrService);

  logs = signal<any[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  filteredLogs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.logs();
    if (!term) return all;
    return all.filter(l =>
      l.id?.toString().includes(term) ||
      (l.claimReference || '').toLowerCase().includes(term) ||
      (l.actionTaken || '').toLowerCase().includes(term)
    );
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  ngOnInit() {
    this.isLoading.set(true);
    this.officerService.getAuditLogs().subscribe({
      next: (res) => {
        this.logs.set(res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load audit logs.');
        this.isLoading.set(false);
      },
    });
  }
}
