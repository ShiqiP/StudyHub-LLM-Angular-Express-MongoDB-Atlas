import { Component, signal } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [ChatComponent, MatIconModule, CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 transition-opacity duration-300" [ngClass]="{'opacity-0 pointer-events-none': !$chatVisible(), 'opacity-100': $chatVisible()}" (click)="setChatVisible(false)"></div>

    <div>
    </div>
    @if($chatVisible()){
      <div class="h-screen right-0 top-0 z-10 w-3/5 fixed  bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        <app-chat ></app-chat>
      </div>
    }
    <div class="suspended-ball fixed bottom-8 right-8 w-16 h-16 bg-blue-500 rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-transform duration-300 animate-bounce" (click)="setChatVisible(true)">
      <div class="absolute inset-0 flex items-center justify-center text-white">
        <mat-icon aria-hidden="false"   class="white cursor-pointer text-4x"  (click)="setChatVisible(true)" fontIcon="chat"></mat-icon>
      </div>
    </div>

`,
  styles: ``
})
export class DashboardComponent {
  $chatVisible = signal(false)

  setChatVisible(visible: boolean) {
    this.$chatVisible.set(visible)
  }
}
