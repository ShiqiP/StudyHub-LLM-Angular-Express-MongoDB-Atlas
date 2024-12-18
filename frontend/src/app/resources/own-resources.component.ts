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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../components/Dialog/ConfirmDialog.components';
import { GetResources } from './dtos/get.resources.dto';

@Component({
  selector: 'app-own-resources',
  imports: [MatButtonModule, RouterLink, MatCardModule, MatPaginatorModule],
  template: `
    <div class="flex justify-end mb-3">
      <button [routerLink]="['', 'resources', 'add']" mat-flat-button>Add Resource</button>
    </div>

    <mat-paginator ngClass="mt-5 bg-gray-500" [length]="$total()" [pageSize]="$limit()" [pageSizeOptions]="[4]"
    (page)="handlePageEvent($event)" aria-label="Select page">
</mat-paginator>

<div class="flex m-5 justify-start flex-wrap">
    @for (resource of $ownResources(); track resource._id) {
        <mat-card class="example-card m-3" appearance="outlined">
            <mat-card-header>
                <mat-card-title>{{resource.title}}</mat-card-title>
            </mat-card-header>
            <mat-card-content class="h-full">
                <div class="mt-3">
                    <span class="font-bold mb-2">Access Type: </span>
                    <span>{{resource.accessType == 1 ? 'public' : 'private'}}</span>
                </div>
              @if (resource.resources) {
                <div class="mt-3 file-resource">
                    <div class="font-bold mb-2">Files: </div>
                    @for (f of resource.resources; track f.url) {
                        <div class="cursor-pointer text-blue-600" (click)="downloadFile(f)">{{f.original_name}}</div>
                    }
                </div>
              }
              @if (resource.content) {
                <div class="content mt-3">
                    <div class="font-bold mb-2">Content: </div>
                    <div [innerHTML]="this.$sanitizer.bypassSecurityTrustHtml(resource.content)"></div>
                </div>
              }
            </mat-card-content>
            <mat-card-actions class="mb-3">
            <div class="button-container flex justify-between items-center w-full">
                <span class="mr-5">
                  <svg xmlns="http://www.w3.org/2000/svg" [attr.fill]="resource.likesUserId.includes(loggedInUserId) ? '#3b82f6' : 'none'" viewBox="0 0 24 24" stroke-width="1.5" stroke="#3b82f6" class="size-6 hover:text-blue-400 cursor-pointer inline-block" (click)="updateLike(resource._id, resource.likesUserId.includes(loggedInUserId))">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  {{resource.likesUserId.length}}
                </span>
                <span class="mr-5">
                  <svg [routerLink]="['', 'resources', resource._id]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:text-blue-400 cursor-pointer inline-block">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </span>
                <span class="mr-5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:text-red-600 cursor-pointer inline-block" (click)="delete(resource._id)">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </span>
              </div>
            </mat-card-actions>
        </mat-card>
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
  `
})
export class OwnResourcesComponent {
  #resourceService = inject(ResourcesService);
  $ownResources = signal<ResourceDTO[]>([]);
  $pageIndex = signal<number>(0);
  $limit = signal<number>(10);
  $total = signal<number>(0);
  $sanitizer = inject(DomSanitizer);
  loggedInUserId = inject(StateService).$state()._id;
  dialog = inject(MatDialog)

  constructor() {

    effect(() => {
      this.#resourceService.getOwnResource(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`).subscribe((res: StandardResponse<GetResources>) => {
        this.$ownResources.set(res.data.resources);
        this.$total.set(res.data.total);
      });
    });
  }

  handlePageEvent = ($event: PageEvent) => {
    this.$pageIndex.set($event.pageIndex);
    this.$limit.set($event.pageSize);
  };

  downloadFile = (file: FileUploadDTO) => {
    this.#resourceService.downloadFile(file.url).subscribe((res: Blob) => {
      let blob = new Blob([res], { type: file.original_type });
      saveAs(blob, file.original_name);
    });
  }

  updateLike(resourceId: string, liked: boolean) {
    this.#resourceService.updateLike(resourceId, liked).subscribe(res => {
      this.#resourceService.getOwnResource(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`).subscribe((res: StandardResponse<GetResources>) => {
        this.$ownResources.set(res.data.resources);
        this.$total.set(res.data.total);
      });
    });
  }

  delete(resourceId: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        title: 'warning',
        content: 'Would you like to delete the resource?',
        cancelText: 'cancel',
        confirmText: 'delete'
      }
    })
    dialogRef.componentInstance.confirmed.subscribe(res => {
      if (res) {
        this.#resourceService.delete(resourceId).subscribe(res => {
          this.#resourceService.getOwnResource(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`).subscribe((res: StandardResponse<GetResources>) => {
            this.$ownResources.set(res.data.resources);
            this.$total.set(res.data.total);
          });
        });
      } else {
        dialogRef.close()
      }
    })
  }
}
