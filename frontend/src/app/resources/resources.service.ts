import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ResourceDTO } from './dtos/resources.dto';
import { StandardResponse } from '../common/standard.response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  #http = inject(HttpClient);

  constructor() { }

  addResource(data: FormData) {
    return this.#http.post<StandardResponse<string>>(environment.SERVER_URL + 'resources/', data);
  }

  getOwnResource(queryString: string) {
    return this.#http.get<StandardResponse<ResourceDTO[]>>(environment.SERVER_URL + 'resources/own/' + queryString);
  }

  downloadFile(path: string): Observable<Blob> {
    return this.#http.post(environment.SERVER_URL + 'resources/download', { path: path }, { responseType: 'blob' });
  }

  updateLike(resoureId: string, liked: boolean) {
    return this.#http.put(environment.SERVER_URL + 'resources/' + resoureId + '/like/', { liked: liked });
  }

  delete(resoureId: string) {
    return this.#http.delete(environment.SERVER_URL + 'resources/' + resoureId);
  }
}
