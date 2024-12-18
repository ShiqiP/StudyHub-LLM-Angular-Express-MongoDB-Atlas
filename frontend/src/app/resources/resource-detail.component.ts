import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { ResourcesService } from './resources.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ResourceDTO } from './dtos/resources.dto';
import { ResourceAccessTypeEnum } from '../common/resource.accesstype.enum';
import { switchMap } from 'rxjs';
import { UsersService } from '../users/users.service';
import { saveAs } from 'file-saver';
import { FileUploadDTO } from './dtos/resources.dto';
import { FormsModule } from '@angular/forms';
import { initial_state, StateService } from '../state.service';

@Component({
  selector: 'app-resource-detail',
  imports: [ChatComponent, MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="text-3xl font-bold mb-4">{{$data().title }}</div>
      <div class="flex items-center mb-6">
        <!-- <img [src]="$author().picture.url" alt="Author" class="w-10 h-10 rounded-full mr-4"> -->
        <div>
          <p class="font-semibold">{{$author().fullname}}</p>
          <p class="text-gray-500 text-sm">{{$author().createdAt | date:'mediumDate'}}</p>
        </div>
      </div>
      <div class="prose max-w-none mb-8" [innerHTML]="this.$sanitizer.bypassSecurityTrustHtml($data().content || '')"></div>
    </div>   

    <!-- PDF Files Section --> 
    <div class="border-t pt-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Attached Files</h2>
        <div class="space-y-4">
          <div *ngFor="let file of $data().resources" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{{file.original_name}}</span>
            </div>
            <button (click)="downloadPdf(file)" class="text-blue-500 hover:text-blue-700">Download</button>
          </div>
        </div>
      </div>
      <!-- Interaction Section -->
      <div class="border-t py-6">
        <div class="flex items-center justify-between ">
          <div class="flex items-center space-x-4 mb-6">
            <button (click)="toggleLike()" class="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
              <svg class="text-blue-500" [ngClass]="{'text-blue-500': isLiked()}" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" [attr.fill]="isLiked()? '#3b82f6' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{{$data().likesUserId.length}} likes</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{{$data().comment.length}} comments</span>
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="space-y-6 mb-2">
          <div class="mb-6">
            <textarea [(ngModel)]="newComment" rows="3" class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500" placeholder="Add a comment..."></textarea>
            <button (click)="addComment()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Post Comment</button>
          </div>
          @for(comment of $data().comment; track comment._id){
          <div  class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center mb-4">
              <div>
                <p class="font-semibold">{{comment.user.fullname}}</p>
                <p class="text-gray-500 text-sm">{{comment.createdAt || 0 | date:'shortTime'}}</p>
              </div>
            </div>
            <p class="text-gray-700">{{comment.comment}}</p>
          </div>
        }
        </div>

    <!-- chat -->
    <div class="fixed inset-0 bg-black/50 transition-opacity duration-300" [ngClass]="{'opacity-0 pointer-events-none': !$chatVisible(), 'opacity-100': $chatVisible()}" (click)="setChatVisible(false)"></div>
    @if($chatVisible()){
      <div class="h-screen right-0 top-0 z-10 w-3/5 fixed  bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        <app-chat [$resourceId]="$resourceId() || '0'"></app-chat>
      </div>
    }
    <div class="suspended-ball fixed bottom-8 right-8 w-16 h-16 bg-blue-500 rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-transform duration-300 animate-bounce" (click)="setChatVisible(true)">
      <div class="absolute inset-0 flex items-center justify-center text-white">
        <mat-icon aria-hidden="false"   class="white cursor-pointer text-4x"  (click)="setChatVisible(true)" fontIcon="chat"></mat-icon>
      </div>
    </div>
  `,
  styles: ``
})
export class ResourceDetailComponent {
  state_service = inject(StateService);

  $resourceId = input<string>('');
  $chatVisible = signal(false)
  $data = signal<ResourceDTO>({
    _id: '',
    title: '',
    content: '',
    resources: [],
    embeddedText: '',
    contentEmbedding: [],
    accessType: ResourceAccessTypeEnum.private, // 0-private 1-public
    author: '',
    likesUserId: [], // store the userId
    comment: [],

  })

  $author = signal({
    picture: { url: '' },
    fullname: '',
    createdAt: 0
  })
  isLiked = computed(() => {
    return this.$data().likesUserId.includes(this.state_service.$state()._id)
  })
  $sanitizer = inject(DomSanitizer);

  #resourceService = inject(ResourcesService)
  #userService = inject(UsersService)

  newComment = "";

  setChatVisible(visible: boolean) {
    this.$chatVisible.set(visible)
  }

  downloadPdf(file: FileUploadDTO) {
    this.#resourceService.downloadFile(file.url).subscribe((res: Blob) => {
      let blob = new Blob([res], { type: file.original_type });
      saveAs(blob, file.original_name);
    });
  }

  addComment() {
    this.#resourceService.addComment({ resourceId: this.$resourceId(), comment: this.newComment, parentId: '0' }).subscribe(() => {
      if (this.newComment.trim()) {
        this.getData();
        this.newComment = "";
      }
    })
  }
  toggleLike() {
    this.#resourceService.updateLike(this.$resourceId(), this.isLiked()).subscribe(res => {
      this.getData()
    });
  }
  getData() {
    this.#resourceService.getResource(this.$resourceId()).pipe(
      switchMap((data, index) => {
        this.$data.set(data.data);
        return this.#userService.getUser(data.data.author)
      })
    ).subscribe((result) => {
      if (result.data)
        this.$author.set(result.data || {})
    })
  }
  ngOnInit() {
    this.getData()
  }
}
