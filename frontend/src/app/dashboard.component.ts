import { Component, effect, inject, signal } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ResourcesService } from './resources/resources.service';
import { FileUploadDTO, ResourceDTO } from './resources/dtos/resources.dto';
import { DomSanitizer } from '@angular/platform-browser';
import { StateService } from './state.service';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { Router, RouterLink } from '@angular/router';
import { StandardResponse } from './common/standard.response';
import { GetResources } from './resources/dtos/get.resources.dto';

@Component({
  selector: 'app-dashboard',
  imports: [ChatComponent, MatIconModule, CommonModule, MatCardModule, MatPaginatorModule, RouterLink],
  template: `
    <div class="z-10 fixed inset-0 bg-black/50 transition-opacity duration-300" [ngClass]="{'opacity-0 pointer-events-none': !$chatVisible(), 'opacity-100': $chatVisible()}" (click)="setChatVisible(false)"></div>
    <div>
    </div>
    @if($chatVisible()){
      <div class="h-screen right-0 top-0 z-10 w-3/5 fixed  bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        <app-chat ></app-chat>
      </div>
    }
    <div class="suspended-ball fixed bottom-8 right-8 w-16 h-16 bg-blue-500 rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-transform duration-300 animate-bounce" (click)="setChatVisible(true)">
      <div class="absolute inset-0 flex items-center justify-center text-white">
        <mat-icon aria-hidden="false"   class="white cursor-pointer text-4x"  (click)="setChatVisible(true)" fontIcon="chat"></mat-icon>
      </div>
    </div>

    <mat-paginator ngClass="mt-5 bg-gray-500" [length]="$total()" [pageSize]="$limit()" [pageSizeOptions]="[4, 10]"
    (page)="handlePageEvent($event)" aria-label="Select page">
    </mat-paginator>

<div class="flex m-5 justify-start flex-wrap z-0">
    @for (resource of $resources(); track resource._id) {
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
                        <div class="cursor-pointer text-blue-500" (click)="downloadFile(f)">{{f.original_name}}</div>
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
                    <svg xmlns="http://www.w3.org/2000/svg" [attr.fill]="resource.likesUserId.includes(loggedInUserId) ? '#3b82f6' : 'none'" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:text-blue-400 cursor-pointer inline-block" (click)="updateLike(resource._id, resource.likesUserId.includes(loggedInUserId))">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    {{resource.likesUserId.length}}
              </span>
                <span class="mr-5">
                  <svg [routerLink]="['', 'resources', resource._id]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:text-blue-400 cursor-pointer inline-block">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
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
export class DashboardComponent {
  $chatVisible = signal(false)

  setChatVisible(visible: boolean) {
    this.$chatVisible.set(visible)
  }

  #resourceService = inject(ResourcesService);
  $resources = signal<ResourceDTO[]>([]);
  $pageIndex = signal<number>(0);
  $limit = signal<number>(10);
  $total = signal<number>(0);
  $sanitizer = inject(DomSanitizer);
  loggedInUserId = inject(StateService).$state()._id;
  dialog = inject(MatDialog);
  router = inject(Router);

  constructor() {
    effect(() => {
      this.#resourceService.getResources(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`).subscribe((res: StandardResponse<GetResources>) => {
        this.$resources.set(res.data.resources);
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

    if (!this.loggedInUserId) {
      this.router.navigate(['', 'signin']);
    }

    this.#resourceService.updateLike(resourceId, liked).subscribe(res => {
      this.#resourceService.getOwnResource(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`).subscribe((res: StandardResponse<GetResources>) => {
        this.$resources.set(res.data.resources);
        this.$total.set(res.data.total);
      });
    });
  }
}
