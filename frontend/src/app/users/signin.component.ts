import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { Router } from '@angular/router';
import { Token, User } from './user.type';
import { StateService } from '../state.service';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="go()">
      <input placeholder="email" class="border-2 border-black" [formControl]="form.controls.email"/>
      <input placeholder="password" class="border-2 border-black" [formControl]="form.controls.password"/>
      <button [disabled]="form.invalid" class="p-2 bg-blue-400 m-2">Go</button>
    </form>
  `,
  styles: ``
})
export class SigninComponent {
  #users_service = inject(UsersService);
  #state = inject(StateService);
  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    'email': ['roshan.maharjan@miu.edu', Validators.required],
    'password': ['test', Validators.required],
  });

  go() {
    this.#users_service.signin(this.form.value as User).subscribe(response => {
      const decoded = jwtDecode(response.data.token) as Token;
      this.#state.$state.set({
        _id: decoded._id,
        fullname: decoded.fullname,
        email: decoded.email,
        jwt: response.data.token
      });
      this.#router.navigate(['', 'diaries']);
    });
  }
}
