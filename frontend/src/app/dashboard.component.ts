import { Component, effect, inject, signal } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ResourcesService } from './resources/resources.service';
import { FileUploadDTO, ResourceDTO } from './resources/dtos/resources.dto';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { StandardResponse } from './common/standard.response';
import { GetResources } from './resources/dtos/get.resources.dto';
import { ResourceCardComponent } from './components/resource-card';

@Component({
  selector: 'app-dashboard',
  imports: [
    ChatComponent,
    MatIconModule,
    CommonModule,
    MatPaginatorModule,
    ResourceCardComponent,
  ],
  template: `
    <div
      class="z-10 fixed inset-0 bg-black/50 transition-opacity duration-300"
      [ngClass]="{
        'opacity-0 pointer-events-none': !$chatVisible(),
        'opacity-100': $chatVisible()
      }"
      (click)="setChatVisible(false)"
    ></div>
    <div></div>
    @if($chatVisible()){
    <div
      class="h-screen right-0 top-0 z-10 w-3/5 fixed  bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
    >
      <app-chat></app-chat>
    </div>
    }
    <div
      class="suspended-ball fixed bottom-8 right-8 w-16 h-16 bg-blue-500 rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-transform duration-300 animate-bounce"
      (click)="setChatVisible(true)"
    >
      <div class="absolute inset-0 flex items-center justify-center text-white">
        <mat-icon
          aria-hidden="false"
          class="white cursor-pointer text-4x"
          fontIcon="chat"
        ></mat-icon>
      </div>
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
      @for (resource of $resources(); track resource._id) {
        <resource-card [resource]="resource" (refresh)="getData()"></resource-card>
      }
    </div>


  `,
  styles: `


  `,
})
export class DashboardComponent {
  $chatVisible = signal(false);

  setChatVisible(visible: boolean) {
    this.$chatVisible.set(visible);
  }

  #resourceService = inject(ResourcesService);
  $resources = signal<ResourceDTO[]>([]);
  $pageIndex = signal<number>(0);
  $limit = signal<number>(10);
  $total = signal<number>(0);
  dialog = inject(MatDialog);
  router = inject(Router);

  constructor() {
    effect(() => {
      this.getData();
    });
  }
  getData() {
    this.#resourceService
      .getResources(`?page=${this.$pageIndex() + 1}&limit=${this.$limit()}`)
      .subscribe((res: StandardResponse<GetResources>) => {
        this.$resources.set(res.data.resources);
        this.$total.set(res.data.total);
      });
  }
  handlePageEvent = ($event: PageEvent) => {
    this.$pageIndex.set($event.pageIndex);
    this.$limit.set($event.pageSize);
  };
}
