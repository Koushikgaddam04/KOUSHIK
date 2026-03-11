import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../agent.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideAngularModule, Search, Shield, Clock, Filter } from 'lucide-angular';

@Component({
  selector: 'app-agent-history',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, LucideAngularModule],
  template: `
    <app-loading-spinner [show]="isLoading()" message="Loading History..."></app-loading-spinner>

    <div class="mb-10">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Validation Archive</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Historical register of policy and document authentication procedures.</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="relative w-full md:w-96 group">
          <lucide-icon
            name="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
          ></lucide-icon>
          <input
            type="text"
            placeholder="Search by ID, policy, or action..."
            (input)="onSearch($event)"
            class="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div class="flex items-center gap-2">
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              Total Entries: {{ filteredHistory().length }}
           </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entry ID</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Target Policy</th>
              <th scope="col" class="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Operation Details</th>
              <th scope="col" class="px-6 py-4 text-right text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Completion Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            @if (filteredHistory().length === 0) {
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                  <p>No verification history found.</p>
                </td>
              </tr>
            }
            @for (item of filteredHistory(); track item.id) {
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                <td class="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-slate-400 group-hover:text-slate-600 transition-colors">#{{ item.id }}</td>
                <td class="px-6 py-5 whitespace-nowrap">
                   <div class="flex items-center gap-2">
                      <div class="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <lucide-icon name="shield" class="h-3.5 w-3.5"></lucide-icon>
                      </div>
                      <span class="text-sm font-black text-slate-800 dark:text-slate-200">Policy #{{ item.policyId || 'N/A' }}</span>
                   </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                    {{ item.actionDetails }}
                  </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-right">
                   <div class="text-xs font-black text-slate-700 dark:text-slate-300">{{ (item.date | date: 'MMM d, y') }}</div>
                   <div class="text-[10px] font-bold text-slate-400 mt-0.5">{{ (item.date | date: 'h:mm a') }}</div>
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
  searchTerm = signal('');

  filteredHistory = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.history();
    if (!term) return all;
    return all.filter(h =>
      h.id?.toString().includes(term) ||
      (h.policyId || '').toString().includes(term) ||
      (h.actionDetails || '').toLowerCase().includes(term)
    );
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

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
