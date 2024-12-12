import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="go()">
      <input placeholder="email" [formControl]="form.controls.email"/>
      <input placeholder="fullname" [formControl]="form.controls.fullname"/>
      <input placeholder="password" [formControl]="form.controls.password"/>
      <input type="file" [formControl]="form.controls.file" (change)="pickup_file($event)"/>
      <button [disabled]="form.invalid">Go</button>
    </form>
  `,
  styles: ``
})
export class SignupComponent {
  #profile_picture!: File;
  #users_service = inject(UsersService);
  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    'email': ['mike@miu.edu', Validators.required],
    'fullname': ['Mike Saad', Validators.required],
    'password': ['123456', Validators.required],
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
