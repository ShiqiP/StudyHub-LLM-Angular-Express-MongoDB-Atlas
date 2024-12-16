import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  #http = inject(HttpClient);

  constructor() { }

  addResource(data: FormData) {
    return this.#http.post<{ success: boolean, data: string; }>(environment.SERVER_URL + 'resources/', data);
  }
}
