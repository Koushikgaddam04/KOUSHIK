import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Search, ListX, Hash, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-action-logs',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule, FormsModule],
    template: `
    <app-loading-spinner [show]="isLoading()" message="Loading System Logs..."></app-loading-spinner>

    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Audit Trail</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Monitoring system-wide resource mutations and administrative interventions.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div class="relative w-full md:w-96 group">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search by log ID, entity, or action..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            class="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div class="flex items-center gap-2">
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              Entries: {{ filteredLogs().length }}
           </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Event ID</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entity & Reference</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Action Sequence</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Operational Context</th>
              <th scope="col" class="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            @if (filteredLogs().length === 0 && !isLoading()) {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <div class="flex flex-col items-center">
                    <lucide-icon name="list-x" class="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3"></lucide-icon>
                    <p class="text-lg font-medium text-slate-700 dark:text-slate-300">No Action Logs Found</p>
                    <p class="text-sm mt-1">Try adjusting your search query.</p>
                  </div>
                </td>
              </tr>
            }
            @for (item of filteredLogs(); track item.id) {
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                <td class="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-slate-400 group-hover:text-slate-600 transition-colors">#{{ item.id }}</td>
                <td class="px-6 py-5 whitespace-nowrap text-sm font-black text-indigo-600 dark:text-indigo-400">
                  <div class="flex items-center gap-2">
                     <lucide-icon name="hash" class="h-3 w-3 opacity-50"></lucide-icon>
                     {{ item.claimReference || 'Unknown' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800': item.actionTaken === 'ClaimDecision',
                          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800': item.actionTaken === 'PolicyVerification',
                          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800': item.actionTaken === 'AgentAssignment',
                          'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700': !['ClaimDecision', 'PolicyVerification', 'AgentAssignment'].includes(item.actionTaken)
                        }">
                    {{ item.actionTaken || 'System Event' }}
                  </span>
                </td>
                <td class="px-6 py-5 text-xs font-medium text-slate-600 dark:text-slate-300 max-w-xs truncate" [title]="item.newValue || item.reason || 'N/A'">
                  {{ item.newValue || item.reason || 'N/A' }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-right">
                  <div class="text-xs font-black text-slate-700 dark:text-slate-300">
                    {{ (item.dateTime | date: 'MMM d, y':'+0530') }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-400 mt-0.5">
                    {{ (item.dateTime | date: 'h:mm a':'+0530') }}
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminActionLogsComponent implements OnInit {
    private adminService = inject(AdminService);
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
            (l.actionTaken || '').toLowerCase().includes(term) ||
            (l.reason || '').toLowerCase().includes(term) ||
            (l.newValue || '').toLowerCase().includes(term)
        );
    });

    ngOnInit() {
        this.isLoading.set(true);
        this.adminService.getActionLogs().subscribe({
            next: (res) => {
                this.logs.set(res || []);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Failed to load system action logs.');
                this.isLoading.set(false);
            }
        });
    }
}
