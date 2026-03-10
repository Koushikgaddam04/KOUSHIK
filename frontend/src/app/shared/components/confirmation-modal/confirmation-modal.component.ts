import { Component, EventEmitter, input, Output } from '@angular/core';

import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300"
      >
        <div
          class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden transform transition-all border border-transparent dark:border-slate-800"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <lucide-icon name="alert-triangle" class="h-5 w-5 text-red-600 dark:text-red-500"></lucide-icon>
                </div>
                <h3 class="text-lg leading-6 font-semibold text-slate-900 dark:text-slate-100">{{ title() }}</h3>
              </div>
              <button (click)="close.emit()" class="text-slate-400 hover:text-slate-500 transition-colors">
                <lucide-icon name="x" class="h-5 w-5"></lucide-icon>
              </button>
            </div>
            <div class="mt-4 ml-13">
              <p class="text-sm text-slate-600 dark:text-slate-400 border-l-2 pl-3 border-red-200 dark:border-red-900/50">
                {{ message() }}
              </p>
            </div>
          </div>
          <div
            class="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 dark:border-slate-800"
          >
            <button
              type="button"
              (click)="confirm.emit()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              {{ confirmText() }}
            </button>
            <button
              type="button"
              (click)="close.emit()"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-900 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-enterprise-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmationModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirm Action');
  message = input<string>('Are you sure you want to perform this action? This cannot be undone.');
  confirmText = input<string>('Confirm');

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
