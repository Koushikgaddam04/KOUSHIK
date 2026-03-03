import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, LogOut, UserCircle } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header
      class="h-16 bg-white border-b border-gray-200 fixed top-0 w-full z-10 flex items-center justify-between px-6 shadow-sm"
    >
      <div class="flex items-center">
        <div
          class="flex items-center gap-2 text-enterprise-blue-800 font-bold text-xl tracking-tight"
        >
          <lucide-icon name="shield-check" class="h-7 w-7 text-blue-600"></lucide-icon>
          <span>HIMS <span class="text-blue-600">Portal</span></span>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700 border border-slate-200"
        >
          <lucide-icon name="user-circle" class="h-5 w-5 text-slate-500"></lucide-icon>
          <span>{{ authService.currentUser()?.email }}</span>
          <span class="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{{
            authService.currentUser()?.role
          }}</span>
        </div>

        <button
          (click)="logout()"
          class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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

  logout() {
    this.authService.logout();
  }
}
