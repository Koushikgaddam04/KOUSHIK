import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../officer.service';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Officer Overview</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Real-time statistics for health insurance claims.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <lucide-icon name="activity" class="h-6 w-6 text-blue-600 dark:text-blue-400"></lucide-icon>
          </div>
          <span class="text-xs font-medium text-slate-400">Total Claims</span>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats().total }}</div>
        <div class="mt-2 text-sm text-slate-500 dark:text-slate-400">Claims processed to date</div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <lucide-icon name="clock" class="h-6 w-6 text-yellow-600 dark:text-yellow-400"></lucide-icon>
          </div>
          <span class="text-xs font-medium text-slate-400">Pending</span>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats().pending }}</div>
        <div class="mt-2 text-sm text-slate-500 dark:text-slate-400 text-yellow-600">Awaiting review</div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <lucide-icon name="check-circle" class="h-6 w-6 text-green-600 dark:text-green-400"></lucide-icon>
          </div>
          <span class="text-xs font-medium text-slate-400">Approved</span>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats().approved }}</div>
        <div class="mt-2 text-sm text-green-600">Successfully settled</div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <lucide-icon name="x-circle" class="h-6 w-6 text-red-600 dark:text-red-400"></lucide-icon>
          </div>
          <span class="text-xs font-medium text-slate-400">Rejected</span>
        </div>
        <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats().rejected }}</div>
        <div class="mt-2 text-sm text-red-600">Policy violations</div>
      </div>
    </div>

    <!-- Charts/Info Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Recent Claim Activity</h3>
        <div class="space-y-4">
          @for (item of recentActivity(); track item.id) {
            <div class="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div class="w-2 h-2 rounded-full mr-4" [ngClass]="item.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{item.reference}} - {{item.status}}</p>
                <p class="text-xs text-slate-500">{{item.date | date:'short'}}</p>
              </div>
            </div>
          } @empty {
            <div class="text-center py-12 text-slate-400">
              No recent activity recorded.
            </div>
          }
        </div>
      </div>

      <div class="bg-blue-600 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between overflow-hidden relative">
        <div class="relative z-10">
          <lucide-icon name="shield-check" class="h-10 w-10 mb-4 opacity-80"></lucide-icon>
          <h3 class="text-xl font-bold mb-2">Claim Integrity</h3>
          <p class="text-blue-100 text-sm mb-6">Every claim is validated against active policy coverage limits automatically.</p>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center"><lucide-icon name="check" class="h-4 w-4 mr-2"></lucide-icon> Automatic deduction</li>
            <li class="flex items-center"><lucide-icon name="check" class="h-4 w-4 mr-2"></lucide-icon> Zero-balance protection</li>
            <li class="flex items-center"><lucide-icon name="check" class="h-4 w-4 mr-2"></lucide-icon> Audit log generation</li>
          </ul>
        </div>
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  `,
})
export class OfficerDashboardComponent implements OnInit {
  private officerService = inject(OfficerService);

  stats = signal({ total: 0, pending: 0, approved: 0, rejected: 0 });
  recentActivity = signal<any[]>([]);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    forkJoin({
      pending: this.officerService.getPendingClaims(),
      logs: this.officerService.getAuditLogs()
    }).subscribe({
      next: ({ pending, logs }) => {
        // Backend returns: { id, claimReference, actionTaken, dateTime }
        // 'actionTaken' holds the value: 'Approved', 'Rejected', 'ClaimSubmission', etc.
        const decisions = logs.filter((l: any) =>
          l.actionTaken === 'Approved' || l.actionTaken === 'Rejected'
        );

        const approved = decisions.filter((l: any) => l.actionTaken === 'Approved').length;
        const rejected = decisions.filter((l: any) => l.actionTaken === 'Rejected').length;
        const processed = approved + rejected;

        this.stats.set({
          total: processed + pending.length,
          pending: pending.length,
          approved,
          rejected
        });

        // Map recent decisions to activity feed
        this.recentActivity.set(decisions.slice(0, 5).map((l: any) => ({
          id: l.id,
          reference: l.claimReference || 'Unknown',
          status: l.actionTaken,
          date: l.dateTime
        })));
      },
      error: () => {
        // Keep default zero stats on error
      }
    });
  }
}
