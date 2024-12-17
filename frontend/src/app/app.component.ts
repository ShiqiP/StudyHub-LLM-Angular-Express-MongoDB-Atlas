import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { initial_state, StateService } from './state.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
  <mat-toolbar class="flex justify-between h-20">
    <span>
      <img src="assets/img/logo.png" class="inline-block w-20 h-20 p-2" alt="logo"/>
      Study Hub
    </span>
    <span>
      <a mat-button [routerLink]="['', 'dashboard']">Dashboard</a>
      <a mat-button [routerLink]="['', 'resources']">Resource</a>
    @if(!state_service.isLoggedIn()){
      <a mat-button class="bg-blue-400 p-1" [routerLink]="['','signin']">Signin</a>
      <a mat-button class="bg-blue-400 p-1" [routerLink]="['','signup']">Signup</a>
    } @else {
      <button mat-button (click)="signout()">Signout</button>
    }
    </span>
  </mat-toolbar>
    <div class="my-5 mx-28">
      <router-outlet />
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
