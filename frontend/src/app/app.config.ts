import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { addTokenInterceptor } from './add-token.interceptor';
import { SigninComponent } from './users/signin.component';
import { StateService } from './state.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardComponent } from './dashboard.component';

function initialize() {
  const state_service = inject(StateService);
  const state = localStorage.getItem('DIARY_APP_STATE');
  if (state) {
    state_service.$state.set(JSON.parse(state));
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([addTokenInterceptor])),
    provideAppInitializer(initialize),
    provideRouter([
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'signin', loadComponent: () => import('./users/signin.component').then(c => c.SigninComponent) },
      { path: 'signup', loadComponent: () => import('./users/signup.component').then(c => c.SignupComponent) },
      // { path: 'resources', loadComponent: () => import('./resources/own-resources.component').then(c => c.OwnResourcesComponent)  },
      // {
      //   path: 'diaries',
      //   loadChildren: () => import('./diaries/diaries.routes').then(r => r.diaries_routes),
      //   canActivate: [() => inject(StateService).isLoggedIn()]
      // }
      // { path: 'add-resource', loadComponent: () => import('./resources/add-resources.component').then(c => c.AddResourcesComponent) },
      // { path: 'add-resource', component: AddResourcesComponent },
      {
        path: 'resources',
        loadChildren: () => import('./resources/resources.routes').then(r => r.resources_routes),
        canActivate: [() => inject(StateService).isLoggedIn()]
      }
    ], withComponentInputBinding()), provideAnimationsAsync()
  ]
};
