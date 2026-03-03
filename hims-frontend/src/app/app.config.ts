import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, User, Mail, Lock, UserPlus, ShieldCheck, ClipboardList, CheckCircle, Search, LayoutDashboard, FileText, FileSearch, History, ListChecks, Activity, Check, X, Clock, Briefcase, LogIn, Loader2, Calculator, LogOut, UserCircle, AlertTriangle, UploadCloud, CheckCircle2, ArrowRight, Shield, Trash2, DollarSign, ShieldAlert, FileWarning, Sun, Moon, XCircle, Wallet, Banknote, FileCheck, CreditCard, Eye, Download, Heart, Zap, Play } from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    importProvidersFrom(LucideAngularModule.pick({ User, Mail, Lock, UserPlus, ShieldCheck, ClipboardList, CheckCircle, Search, LayoutDashboard, FileText, FileSearch, History, ListChecks, Activity, Check, X, Clock, Briefcase, LogIn, Loader2, Calculator, LogOut, UserCircle, AlertTriangle, UploadCloud, CheckCircle2, ArrowRight, Shield, Trash2, DollarSign, ShieldAlert, FileWarning, Sun, Moon, XCircle, Wallet, Banknote, FileCheck, CreditCard, Eye, Download, Heart, Zap, Play }))
  ]
};
