import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CustomerService } from '../customer.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-support',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Floating Chat Toggle Button -->
    <button
      (click)="toggleChat()"
      class="fixed bottom-8 right-8 z-[100] p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
      [class.rotate-90]="isOpen()"
    >
      @if (isOpen()) {
        <lucide-icon name="x" class="h-6 w-6"></lucide-icon>
      } @else {
        <div class="relative">
          <lucide-icon name="message-square" class="h-6 w-6"></lucide-icon>
          <span class="absolute -top-1 -right-1 flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      }
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div
        class="fixed bottom-24 right-8 z-[100] w-[400px] h-[600px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
      >
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-xl">
              <lucide-icon name="bot" class="h-6 w-6"></lucide-icon>
            </div>
            <div>
              <h3 class="font-black text-lg tracking-tight">NexusCare Assistant</h3>
              <p class="text-[10px] uppercase font-bold text-blue-100 tracking-widest flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
              </p>
            </div>
          </div>
          <button (click)="clearChat()" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Clear Chat">
            <lucide-icon name="rotate-ccw" class="h-4 w-4"></lucide-icon>
          </button>
        </div>

        <!-- Messages Area -->
        <div
          #scrollContainer
          class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50 dark:bg-slate-950"
        >
          @for (msg of messages(); track msg.timestamp) {
            <div class="flex flex-col" [class.items-end]="msg.role === 'user'">
              <div
                class="max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed"
                [ngClass]="{
                  'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20': msg.role === 'user',
                  'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700': msg.role === 'assistant'
                }"
              >
                {{ msg.content }}
              </div>
              <span class="text-[9px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-tighter">
                {{ msg.timestamp | date:'shortTime' }}
              </span>
            </div>
          }

          @if (isTyping()) {
            <div class="flex items-end gap-2">
              <div class="p-4 bg-white dark:bg-slate-800 rounded-3xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex gap-1">
                <span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form (submit)="sendMessage($event)" class="relative flex items-center">
            <input
              type="text"
              [(ngModel)]="currentInput"
              name="message"
              [disabled]="isTyping()"
              autocomplete="off"
              placeholder="Ask about claims, policies..."
              class="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              [disabled]="!currentInput.trim() || isTyping()"
              class="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-90 transition-all shadow-lg shadow-blue-500/20"
            >
              <lucide-icon name="send" class="h-4 w-4"></lucide-icon>
            </button>
          </form>
          <p class="text-[9px] text-center text-slate-400 dark:text-slate-500 mt-4 font-bold uppercase tracking-[0.15em]">
            Powered by Groq AI Intelligence
          </p>
        </div>
      </div>
    }
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ChatbotSupportComponent implements AfterViewChecked {
  private customerService = inject(CustomerService);
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  currentInput = '';
  
  messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your NexusCare Assistant. How can I guide you today? You can ask about filing claims, checking your coverage, or any other insurance-related issues.',
      timestamp: new Date()
    }
  ]);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  clearChat() {
    this.messages.set([
      {
        role: 'assistant',
        content: 'Hello! Chat cleared. How else can I help you?',
        timestamp: new Date()
      }
    ]);
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const msg = this.currentInput.trim();
    if (!msg || this.isTyping()) return;

    // Add user message
    this.messages.update(msgs => [...msgs, {
      role: 'user',
      content: msg,
      timestamp: new Date()
    }]);

    this.currentInput = '';
    this.isTyping.set(true);

    this.customerService.askChatbot(msg).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: res.response,
          timestamp: new Date()
        }]);
        this.isTyping.set(false);
      },
      error: () => {
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting to the AI brain right now. Please try again later.',
          timestamp: new Date()
        }]);
        this.isTyping.set(false);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
