import { Component, input } from '@angular/core';

import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (show()) {
      <div
        class="fixed inset-0 bg-slate-100/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
      >
        <lucide-icon
          name="loader-2"
          class="h-10 w-10 text-enterprise-blue-600 animate-spin"
        ></lucide-icon>
        <p class="mt-4 text-enterprise-blue-800 font-medium animate-pulse">{{ message() }}</p>
      </div>
    }
  `,
})
export class LoadingSpinnerComponent {
  show = input<boolean>(false);
  message = input<string>('Processing...');
}
