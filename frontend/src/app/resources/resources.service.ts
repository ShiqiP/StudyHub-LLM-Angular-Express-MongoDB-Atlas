import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ResourceDTO } from './dtos/resources.dto';
import { StandardResponse } from '../common/standard.response';
import { Observable } from 'rxjs';
import { GetResources } from './dtos/get.resources.dto';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  #http = inject(HttpClient);

  constructor() { }

  addResource(data: FormData) {
    return this.#http.post<StandardResponse<string>>('resources/', data);
  }

  getOwnResource(queryString: string) {
    return this.#http.get<StandardResponse<GetResources>>('resources/own/' + queryString);
  }

  downloadFile(path: string): Observable<Blob> {
    return this.#http.post('resources/download', { path: path }, { responseType: 'blob' });
  }

  updateLike(resoureId: string, liked: boolean) {
    return this.#http.put('resources/' + resoureId + '/like/', { liked: liked });
  }

  delete(resoureId: string) {
    return this.#http.delete('resources/' + resoureId);
  }

  getResources(queryString: string) {
    return this.#http.get<StandardResponse<GetResources>>('resources/' + queryString);
  }
}
