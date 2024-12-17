import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="go()">
        <h2 class="mb-3">Signup</h2>
          <mat-form-field>
            <input matInput placeholder="Email" [formControl]="form.controls.email" name="email">
            <mat-error>
              Please provide a valid email address
            </mat-error>
          </mat-form-field>
          <mat-form-field>
            <input matInput placeholder="Fullname" [formControl]="form.controls.fullname" name="fullname">
            <mat-error>
              Please provide a fullname
            </mat-error>
          </mat-form-field>
          <mat-form-field>
            <input matInput placeholder="Password" [formControl]="form.controls.password" name="password">
            <mat-error>
              Please provide a password
            </mat-error>
          </mat-form-field>
          <div class="flex justify-start">
            <input type="file" [formControl]="form.controls.file" (change)="pickup_file($event)"/>
          </div>
          <div class="flex justify-start mt-5">
          <button class="text-left" type="submit" mat-flat-button color="primary" [disabled]="!form.valid">Singup</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
  mat-card {
  max-width: 600px;
  margin: 2em auto;
  text-align: center;
}

mat-form-field {
  display: block;
}
`
})
export class SignupComponent {
  #profile_picture!: File;
  #users_service = inject(UsersService);
  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    'email': ['', Validators.required],
    'fullname': ['', Validators.required],
    'password': ['', Validators.required],
    'file': ['', Validators.required],
  });
  pickup_file(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files!.length) {
      this.#profile_picture = input.files![0];
    }

  }
  go() {
    const formData = new FormData();
    formData.append('email', this.form.controls.email.value);
    formData.append('fullname', this.form.controls.fullname.value);
    formData.append('password', this.form.controls.password.value);
    formData.append('profile_picture', this.#profile_picture);
    this.#users_service.singup(formData).subscribe(response => {
      console.log(response);
      this.#router.navigate(['', 'signin']);
    });
  }
}
