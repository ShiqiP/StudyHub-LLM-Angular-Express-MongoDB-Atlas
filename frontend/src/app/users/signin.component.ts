import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { Router } from '@angular/router';
import { Token, User } from './user.type';
import { StateService } from '../state.service';
import { jwtDecode } from 'jwt-decode';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <!-- <form [formGroup]="form" (ngSubmit)="go()">
      <input placeholder="email" class="border-2 border-black" [formControl]="form.controls.email"/>
      <input placeholder="password" class="border-2 border-black" [formControl]="form.controls.password"/>
      <button [disabled]="form.invalid" class="p-2 bg-blue-400 m-2">Go</button>
    </form> -->
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="go()">
          <h2 class="mb-3">Signin</h2>
          <!-- <mat-error *ngIf="!loginValid">
            The username and password were not recognized
          </mat-error> -->
          <mat-form-field>
            <input matInput placeholder="Email" [formControl]="form.controls.email" name="email" required>
            <mat-error>
              Please provide a valid email address
            </mat-error>
          </mat-form-field>
          <mat-form-field>
            <input matInput type="password" placeholder="Password" [formControl]="form.controls.password" name="password" required>
            <mat-error>
              Please provide a valid password
            </mat-error>
          </mat-form-field>
          <button type="submit" mat-flat-button color="primary" [disabled]="!form.valid">Login</button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
  mat-card {
  max-width: 400px;
  margin: 2em auto;
  text-align: center;
}

mat-form-field {
  display: block;
}
  `
})
export class SigninComponent {
  #users_service = inject(UsersService);
  #state = inject(StateService);
  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    'email': ['shiqi@miu.edu', Validators.required],
    'password': ['shiqi123456', Validators.required],
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
      this.#router.navigate(['', 'dashboard']);
    });
  }
}
