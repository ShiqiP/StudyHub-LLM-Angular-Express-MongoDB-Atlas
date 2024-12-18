import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { StateService } from './state.service';
import { environment } from '../environments/environment.development';
import { Observable, catchError, map } from 'rxjs';
import { Router } from '@angular/router';


export const addTokenInterceptor: (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => Observable<HttpEvent<unknown>> = (req, next) => {

  const token = inject(StateService).$state().jwt;
  const router = inject(Router)
  const modifiedReq = req.clone({
    headers: token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers,
    url: environment.SERVER_URL + req.url,
  });

  return next(modifiedReq).pipe(
    map((event) => {
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['', 'signin'])
      }
      throw error; // Optionally, return an empty observable if desired
    }),
  );
};