import { Component, inject, computed } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  UserPlus,
  FileSearch,
  History,
  ListChecks,
  Activity,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <aside
      class="w-64 h-screen bg-enterprise-blue-900 border-r border-enterprise-blue-800 dark:bg-slate-900 dark:border-slate-800 text-white flex flex-col shadow-lg fixed left-0 top-0 pt-16 transition-colors duration-200"
    >
      <div class="flex-1 overflow-y-auto py-4">
        <nav class="space-y-1 px-3">
          <!-- Admin Links -->
          @if (role() === 'admin') {
            <a
              routerLink="/admin"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="layout-dashboard"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Dashboard
            </a>
            <a
              routerLink="/admin/add-staff"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="user-plus"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Add Staff
            </a>
            <a
              routerLink="/admin/policies"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="shield-check"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Manage Policies
            </a>
          }

          <!-- Customer Links -->
          @if (role() === 'customer') {
            <a
              routerLink="/customer"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="layout-dashboard"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              My Dashboard
            </a>
            <a
              routerLink="/customer/quote"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="file-search"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Get a Quote
            </a>
            <a
              routerLink="/customer/claim"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="file-text"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Submit Claim
            </a>
          }

          <!-- Agent Links -->
          @if (role() === 'agent') {
            <a
              routerLink="/agent"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="list-checks"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Verification Queue
            </a>
            <a
              routerLink="/agent/history"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="history"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Policy History
            </a>
          }

          <!-- Claims Officer Links -->
          @if (role() === 'claimsofficer') {
            <a
              routerLink="/officer"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="layout-dashboard"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Officer Dashboard
            </a>
            <a
              routerLink="/officer/claims"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="activity"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Claims Queue
            </a>
            <a
              routerLink="/officer/logs"
              routerLinkActive="bg-enterprise-blue-700 dark:bg-blue-600/20"
              class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-enterprise-blue-800 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <lucide-icon
                name="history"
                class="mr-3 h-5 w-5 text-enterprise-blue-300 group-hover:text-white transition-colors"
              ></lucide-icon>
              Audit Logs
            </a>
          }
        </nav>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);

  role = computed(() => {
    const r = this.authService.currentUser()?.role;
    return r ? r.toLowerCase().replace(/\s/g, '') : null;
  });
}
