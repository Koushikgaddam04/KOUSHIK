import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-action-logs',
    standalone: true,
    imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule, FormsModule],
    template: `
    <app-loading-spinner [show]="isLoading()" message="Loading System Logs..."></app-loading-spinner>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">System Action Logs</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">A historical view of system-wide interactions and data mutations.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
        <div class="relative w-full md:w-80">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search logs by ID, reference, or action..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            class="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-100 transition-colors"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Log ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity & Ref</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action Taken</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Value / Context</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
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
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-slate-400">#{{ item.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {{ item.claimReference || 'Unknown Entity' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50': item.actionTaken === 'ClaimDecision',
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50': item.actionTaken === 'PolicyVerification',
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50': item.actionTaken === 'AgentAssignment',
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700': !['ClaimDecision', 'PolicyVerification', 'AgentAssignment'].includes(item.actionTaken)
                        }">
                    {{ item.actionTaken || 'System Event' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate" [title]="item.newValue || item.reason || 'N/A'">
                  {{ item.newValue || item.reason || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {{ (item.dateTime | date: 'MMM d, y, h:mm a') || 'Unknown Date' }}
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
