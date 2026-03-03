import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-agent-history',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading History..."></app-loading-spinner>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Verification History</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">A log of all policies you have previously verified.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div class="relative w-64">
          <lucide-icon
            name="search"
            class="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search history..."
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
                Action ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Policy ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Action Details
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @if (history().length === 0) {
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                  <p>No verification history found.</p>
                </td>
              </tr>
            }
            @for (item of history(); track item) {
              <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{{ item.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {{ item.policyId || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Verified Policy</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {{ (item.timestamp | date: 'medium') || 'Unknown Date' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AgentHistoryComponent implements OnInit {
  private agentService = inject(AgentService);
  private toastr = inject(ToastrService);

  history = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.isLoading.set(true);
    this.agentService.getHistory().subscribe({
      next: (res) => {
        this.history.set(res || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load history.');
        this.isLoading.set(false);
      },
    });
  }
}
