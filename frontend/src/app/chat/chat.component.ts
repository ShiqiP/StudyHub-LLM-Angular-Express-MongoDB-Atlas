import { Component, ElementRef, inject, input, resource, signal, viewChildren } from '@angular/core';
import { ChatService } from './chat.service'
import { Router } from '@angular/router';
import { StateService } from '../state.service';
import { Reference, Record } from './chat.type';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialog } from '../../components/Dialog/ConfirmDialog.components';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-chat',
  providers: [ChatService],
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
  <div class="h-[50rem]">
      <div class="flex flex-col h-full">
          <div class="flex gap-3 min-w-max mx-4">
            @for(link of $references(); track link._id){
              <div (click)="go2Route(link)" class="cursor-pointer px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors whitespace-nowrap">{{link.title}}</div>
            }
          </div>
          <div #chatBox class="flex-1 overflow-y-auto bg-gray-50 m-4 p-4 rounded justify-center">
            <div class="flex flex-col ">
              @for(record of $records(); track $index){
                @if(record.type === 0){
                  <div class="text-right">
                    <div class="text-white bg-blue-500 inline-block rounded p-2 my-4">
                      {{record.content}}
                    </div>
                  </div>
                }@else {
                  <div class="text-left w-4/5">
                    <div class="text-gray-800 bg-gray-200 inline-block rounded p-2 my-4">
                      {{record.content}}
                    </div>
                  </div>
                }
              }
              @if($loading()){
                <mat-spinner [diameter]="50"></mat-spinner>
              }

            </div>
          </div>
          <!-- <button (click)="handleSubmit()">submit</button> -->
          <form [formGroup]="form" (ngSubmit)="handleSubmit()"  class="px-4 flex gap-3 justify-center items-center">
            <mat-icon aria-hidden="false" aria-label="Example home icon"  class="text-red-700 cursor-pointer"  (click)="handleDelete()" fontIcon="delete"></mat-icon>
            <input  placeholder="Message and learn" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" [formControl]="form.controls.question"/>
            <button [disabled]="!form.valid" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">send</button>
          </form>
      </div>
    </div>
  `,
  styles: ``
})
export class ChatComponent {

  dialog = inject(MatDialog)
  $chatBox = viewChildren<ElementRef>('chatBox')

  #chatService = inject(ChatService)
  #router = inject(Router)
  #state_service = inject(StateService)

  userId = this.#state_service.$state()._id

  form = inject(FormBuilder).nonNullable.group({
    question: ['', Validators.required]
  })

  $loading = signal<boolean>(false)
  $references = signal<Array<Reference>>([]);
  $records = signal<Array<Record>>([]);
  $chatId = signal<string>('')
  $resourceId = input('0');

  scrollToBottom() {
    const chatBox = this.$chatBox()[0].nativeElement
    chatBox.scrollTop = chatBox.scrollHeight
    chatBox.scrollTo({
      top: chatBox.scrollHeight, // Scroll to the bottom
      behavior: 'smooth' // Smooth scrolling effect
    });
  }

  handleSubmit() {
    // e.preventDefault()
    // e.stopPropagation()
    if (this.$resourceId() === '0') {
      this.handleChatHome();
    } else {
      this.handleChat()
    }

  }

  handleChatHome() {
    this.$loading.set(true)
    const question = this.form.controls.question.value
    let params = { question }
    if (this.$chatId() === '') {
      params = Object.assign(params, { userId: this.userId })
    } else {
      params = Object.assign(params, { chatId: this.$chatId() })
    }

    // update chatBox
    this.$records.update(pre => {
      pre.push({ type: 0, index: pre.length, content: question })
      return pre;
    });
    this.form.patchValue({ question: '' })

    this.#chatService.postChatHome(params).subscribe(data => {
      if (data.data.references!.length > 0) {
        this.$references.set(data.data.references || [])
      }
      this.$chatId.set(data.data._id)

      this.$records.update(pre => {
        pre.push(...data.data.records)
        return pre;
      });
      this.$loading.set(false)
    })
  }
  handleChat() {
    this.$loading.set(true)
    const question = this.form.controls.question.value
    let params = { question }
    if (this.$chatId() === '') {
      params = Object.assign(params, { userId: this.userId, resourceId: this.$resourceId() })
    } else {
      params = Object.assign(params, { chatId: this.$chatId(), resourceId: this.$resourceId() })
    }

    // update chatBox
    this.$records.update(pre => {
      pre.push({ type: 0, index: pre.length, content: question })
      return pre;
    });
    this.form.patchValue({ question: '' })

    this.#chatService.postChat(params).subscribe(data => {
      if (data.data.references && data.data.references!.length > 0) {
        this.$references.set(data.data.references || [])
      }
      this.$chatId.set(data.data._id)
      this.$records.update(pre => {
        pre.push(...data.data.records)
        return pre;
      });
      this.$loading.set(false)
    })
  }

  handleDelete() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        title: 'warning',
        content: 'Would you like to clear the records?',
        cancelText: 'cancel',
        confirmText: 'delete'
      }
    })
    dialogRef.componentInstance.confirmed.subscribe(res => {
      if (res) {
        this.#chatService.deleteChat({ _id: this.$chatId() }).subscribe(() => {
          this.handleGetData()
        })
      } else {
        dialogRef.close()
      }
    })

  }
  handleGetData() {
    const { _id } = this.#state_service.$state()
    this.#chatService.getChat({ userId: _id, type: this.$resourceId() === '0' ? 0 : 1, resourceId: this.$resourceId() }).subscribe((data) => {
      if (data.data !== null) {
        this.$references.set(data.data.references || [])
        this.$records.set(data.data.records || [])
        this.$chatId.set(data.data._id)
      } else {
        this.$references.set([])
        this.$records.set([])
        this.$chatId.set('')
      }
    })
  }
  go2Route(link: any) {
    this.#router.navigate(['', 'resource', link._id])
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  ngOnInit() {
    this.handleGetData()
  }
  constructor() {

  }
}
