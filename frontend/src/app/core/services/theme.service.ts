import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDarkMode = signal<boolean>(localStorage.getItem('theme') === 'dark');

    constructor() {
        effect(() => {
            const dark = this.isDarkMode();
            if (dark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    toggleTheme() {
        this.isDarkMode.update(dark => !dark);
    }
}
