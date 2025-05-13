import {
  Component,
  Input,
  Output,
  input,
  inject,
  computed,
  EventEmitter,
  signal,
  effect,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ResourceDTO, FileUploadDTO } from '../../resources/dtos/resources.dto';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { StateService } from '../../state.service';
import { saveAs } from 'file-saver';
import { ResourcesService } from '../../resources/resources.service';
import { CommonModule } from '@angular/common';
import { ConfirmDialog } from '../Dialog/ConfirmDialog.components';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'resource-card',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  template: `
    <mat-card
      (click)="go2detail()"
      class="!bg-white/80 !rounded-lg overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300  backdrop-blur-sm cursor-pointer group"
    >
      <div class="h-1.5 w-full bg-gradient-to-r bg-blue-500"></div>
      <mat-card-header>
        <mat-card-title class="!text-lg !font-semibold !text-gray-800">{{
          resource().title
        }}</mat-card-title>
      </mat-card-header>
      <mat-card-content class="h-48  overflow-hidden">
        <div class="grid gap-2">
          <div>
            <div
              class="px-2 py-1 text-xs text-gray-500 border rounded-full border-slate-200 bg-gray-50 inline-block"
            >
              {{ resource().accessType == 1 ? 'public' : 'private' }}
            </div>
          </div>
          @if (resource().resources && resource().resources.length > 0) {
          <div>
            <div class="text-sm text-gray-500">Files:</div>
            @for (f of resource().resources; track f.url) {
            <div
              class="cursor-pointer text-sm text-blue-500"
              (click)="downloadFile(f)"
            >
              {{ f.original_name }}
            </div>
            }
          </div>
          } @if (resource().content) {
          <div>
            <div class="text-sm text-gray-500">Content:</div>
            <div class="text-base text-gray-600 text-ellipsis">
              {{ getPlainTextFromHTML(resource().content) }}
            </div>
          </div>
          }
        </div>
      </mat-card-content>
      <mat-card-actions>
        <div class="flex gap-3 items-center">
          <button
            (click)="
              $event.stopPropagation();
              updateLike(
                resource()._id,
                resource().likesUserId.includes(loggedInUserId)
              )
            "
            class="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
          >
            <svg
              class="text-blue-500"
              [ngClass]="{ 'text-blue-500': isLiked() }"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              [attr.fill]="isLiked() ? '#3b82f6' : 'none'"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-gray-600">{{
              resource().likesUserId.length
            }}</span>
          </button>
          <button
            class="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span class="text-gray-600">{{ resource().comment.length }}</span>
          </button>
          @if(deleteIcon()){
          <button
            (click)="
              $event.stopPropagation();
              deleteItem(resource()._id)
            "
            class="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-5 w-5 size-6 hover:text-red-600 cursor-pointer inline-block"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
          }
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: ``,
})
export class ResourceCardComponent {

  @Output() refresh = new EventEmitter();

  readonly resource = input<ResourceDTO>({} as ResourceDTO);
  readonly deleteIcon = input<Boolean>(false);

  dialog = inject(MatDialog);

  router = inject(Router);
  $sanitizer = inject(DomSanitizer);
  loggedInUserId = inject(StateService).$state()._id;
  #resourceService = inject(ResourcesService);
  isLiked = computed(() => {
    return this.resource().likesUserId.includes(this.loggedInUserId);
  });
  constructor() { }
  getPlainTextFromHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  downloadFile = (file: FileUploadDTO) => {
    this.#resourceService.downloadFile(file.url).subscribe((res: Blob) => {
      let blob = new Blob([res], { type: file.original_type });
      saveAs(blob, file.original_name);
    });
  };
  updateLike(resourceId: string, liked: boolean) {
    if (!this.loggedInUserId) {
      this.router.navigate(['', 'signin']);
    }
    this.#resourceService.updateLike(resourceId, liked).subscribe((res) => {
      this.refresh.emit();
    });
  }
  go2detail() {
    this.router.navigate(['', 'resources', this.resource()._id]);
  }
  deleteItem(resourceId: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        title: 'warning',
        content: 'Would you like to delete the resource?',
        cancelText: 'cancel',
        confirmText: 'delete',
      },
    });
    dialogRef.componentInstance.confirmed.subscribe((res) => {
      if (res) {
        this.#resourceService.delete(resourceId).subscribe(res => {
          this.refresh.emit();
        });
      } else {
        dialogRef.close();
      }
    });
  }
}
