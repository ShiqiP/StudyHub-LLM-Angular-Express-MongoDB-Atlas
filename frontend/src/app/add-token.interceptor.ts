import { HttpInterceptorFn, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { StateService } from './state.service';
import { environment } from '../environments/environment.development';
import { Observable, catchError, map } from 'rxjs';

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export const addTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(StateService).$state().jwt;
  if (token) {
    const reqWithToken = req.clone(
      {
        headers: req.headers.set('Authorization', `Bearer ${token}`),
        url: environment.SERVER_URL + req.url
      });
    return next(reqWithToken);
  } else {
    const reqWithoutToken = req.clone(
      {
        url: environment.SERVER_URL + req.url
      });
    return next(reqWithoutToken);
  }

};
