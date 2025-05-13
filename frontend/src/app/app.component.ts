import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { initial_state, StateService } from './state.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
  <div class="bg-[#f6f7f9] min-h-dvh">
    <header class="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
    <!-- <mat-toolbar class="sticky flex justify-between top-0 z-10 backdrop-blur-md   border-gray-200 shadow-sm"> -->
      <div class="container flex items-center justify-between h-16 px-4 mx-auto">
        <div class="flex items-center gap-3">
          <!-- <img src="assets/img/logo.png" class="inline-block w-20 h-20 p-2" alt="logo"/> -->
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r bg-blue-500" >
            Study Hub
          </h1>
        </div>
        <div class="flex gap-4 items-center space-x-1 ">
          <button  class="hover:text-blue-500" [routerLink]="['', 'dashboard']">Dashboard</button>
          <button class="hover:text-blue-500" [routerLink]="['', 'resources']">Resource</button>
          @if(!state_service.isLoggedIn()){
            <button class="bg-violet-10 p-1 hover:text-blue-500" [routerLink]="['','signin']">Signin</button>
            <button  class="bg-violet-10 p-1 hover:text-blue-500" [routerLink]="['','signup']">Signup</button>
          } @else {
            <button  (click)="signout()">Signout</button>
          }
        </div>
      </div>
    </header>
    <!-- </mat-toolbar> -->
    <div class="bg-[#f6f7f9] container px-4 mx-auto my-10">
      <router-outlet />
    </div>
  </div>
  `,
  styles: `
  a{margin-right: 10px}
  ` ,
})
export class AppComponent {
  state_service = inject(StateService);
  #router = inject(Router);

  signout() {
    this.state_service.$state.set(initial_state);
    this.#router.navigate(['', 'signin']);
  }
}
