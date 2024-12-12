import { effect, Injectable, signal } from '@angular/core';

export type GlobalState = {
  fullname: string,
  email: string,
  _id: string,
  jwt: string;
};

export const initial_state = {
  fullname: '',
  email: '',
  _id: '',
  jwt: ''
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  $state = signal<GlobalState>(initial_state);

  myeffect = effect(() => {
    localStorage.setItem('DIARY_APP_STATE', JSON.stringify(this.$state()));
  });

  isLoggedIn() {
    return this.$state()._id ? true : false;
  }
}
