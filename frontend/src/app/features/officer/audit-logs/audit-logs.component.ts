import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../officer.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Search, Clock } from 'lucide-angular';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading Logs..."></app-loading-spinner>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Audit Logs</h1>
      <p class="text-slate-500 mt-1">A historical view of all processed claims.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div class="relative w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search logs..."
            (input)="onSearch($event)"
            class="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Log ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Claim Reference
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Action Taken
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Date & Time
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
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
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{{ item.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {{ item.claimReference || 'Unknown' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800': item.actionTaken === 'Approved',
                      'bg-red-100 text-red-800': item.actionTaken === 'Rejected',
                      'bg-slate-100 text-slate-800':
                        item.actionTaken !== 'Approved' && item.actionTaken !== 'Rejected',
                    }"
                  >
                    {{ item.actionTaken || 'Processed' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {{ (item.dateTime | date: 'medium') || 'Unknown Date' }}
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
