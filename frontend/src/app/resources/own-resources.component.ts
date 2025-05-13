import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ResourcesService } from './resources.service';
import { FileUploadDTO, ResourceDTO } from './dtos/resources.dto';
import { StandardResponse } from '../common/standard.response';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { StateService } from '../state.service';
import { GetResources } from './dtos/get.resources.dto';
import { ResourceCardComponent } from '../components/resource-card';

@Component({
  selector: 'app-own-resources',
  imports: [
    MatButtonModule,
    RouterLink,
    MatCardModule,
    MatPaginatorModule,
    ResourceCardComponent,
  ],
  template: `
    <div class="flex justify-end mb-3 ">
      <button class="bg-blue-500 text-white py-2 px-4 rounded-md" [routerLink]="['', 'resources', 'add']">
        Add Resource
      </button>
    </div>

    <mat-paginator
      ngClass="mt-5 bg-gray-500"
      [length]="$total()"
      [pageSize]="$limit()"
      [hidePageSize]="true"
      (page)="handlePageEvent($event)"
      aria-label="Select page"
    >
    </mat-paginator>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      @for (resource of $ownResources(); track resource._id) {
      <resource-card
        [resource]="resource"
        [deleteIcon]="true"
        (refresh)="getData()"
      ></resource-card>
      }
    </div>


  `,
  styles: `
  .example-card {
    width: 350px;
    height: 400px;
    min-width: 350px;
    min-height: 400px;
    overflow: hidden;
}

  .content {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .card-action {
    width: 400px;
    min-width: 400px;
  }
  `,
})
export class OwnResourcesComponent {
  #resourceService = inject(ResourcesService);
  $ownResources = signal<ResourceDTO[]>([]);
  $pageIndex = signal<number>(0);
  $limit = signal<number>(10);
  $total = signal<number>(0);
  $sanitizer = inject(DomSanitizer);
  loggedInUserId = inject(StateService).$state()._id;

  constructor() {
    effect(() => {
      this.getData();
    });
  }
  getData = () => {
    this.#resourceService
      .getOwnResource(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`)
      .subscribe((res: StandardResponse<GetResources>) => {
        this.$ownResources.set(res.data.resources);
        this.$total.set(res.data.total);
      });
  };
  handlePageEvent = ($event: PageEvent) => {
    this.$pageIndex.set($event.pageIndex);
    this.$limit.set($event.pageSize);
  };

  downloadFile = (file: FileUploadDTO) => {
    this.#resourceService.downloadFile(file.url).subscribe((res: Blob) => {
      let blob = new Blob([res], { type: file.original_type });
      saveAs(blob, file.original_name);
    });
  };
}
