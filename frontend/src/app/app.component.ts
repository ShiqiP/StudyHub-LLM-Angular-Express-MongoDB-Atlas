import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { initial_state, StateService } from './state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>Welcome to {{title}}!</h1>
    @if(!state_service.isLoggedIn()){
      <a class="bg-blue-400 p-1" [routerLink]="['','signin']">Signin</a>
      <a class="bg-blue-400 p-1" [routerLink]="['','signup']">Signup</a>
      <a class="bg-blue-400 p-1" [routerLink]="['','add-resource']">Add-Resource</a>
    }@else {
      <button (click)="signout()">signout</button>
    }
    <router-outlet />
  `,
  styles: [`a{margin-right: 10px}`],
})
export class AppComponent {
  title = 'Auth workshop';
  state_service = inject(StateService);
  #router = inject(Router);

  signout() {
    this.state_service.$state.set(initial_state);
    this.#router.navigate(['', 'signin']);
  }
}
