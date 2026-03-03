import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar></app-navbar>

      <div class="flex pt-16">
        <app-sidebar></app-sidebar>

        <main class="flex-1 ml-64 p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {}
