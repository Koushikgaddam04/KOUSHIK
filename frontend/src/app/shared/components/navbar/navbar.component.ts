import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LucideAngularModule, LogOut, UserCircle, Sun, Moon } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header
      class="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 fixed top-0 w-full z-10 flex items-center justify-between px-6 shadow-sm transition-colors duration-200"
    >
      <div class="flex items-center">
        <div
          class="flex items-center gap-2 text-enterprise-blue-800 dark:text-slate-100 font-bold text-xl tracking-tight"
        >
          <lucide-icon name="shield-check" class="h-7 w-7 text-blue-600"></lucide-icon>
          <span>NexusCare <span class="text-blue-600">Portal</span></span>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Theme Toggle -->
        <button
          (click)="themeService.toggleTheme()"
          class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200"
          [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          @if (themeService.isDarkMode()) {
            <lucide-icon name="sun" class="h-5 w-5 text-yellow-500"></lucide-icon>
          } @else {
            <lucide-icon name="moon" class="h-5 w-5 text-slate-700"></lucide-icon>
          }
        </button>

        <div
          class="flex flex-col items-end mr-2"
        >
          <span class="text-sm font-bold text-slate-900 dark:text-white leading-none">
            {{ authService.currentUser()?.fullName }}
          </span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400">
            {{ authService.currentUser()?.email }}
          </span>
        </div>

        <div
          class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
          <lucide-icon name="user-circle" class="h-5 w-5 text-slate-500 dark:text-slate-400"></lucide-icon>
          <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">{{
            authService.currentUser()?.role
          }}</span>
        </div>

        <button
          (click)="logout()"
          class="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
          title="Logout"
        >
          <lucide-icon name="log-out" class="h-5 w-5"></lucide-icon>
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  logout() {
    this.authService.logout();
  }
}
