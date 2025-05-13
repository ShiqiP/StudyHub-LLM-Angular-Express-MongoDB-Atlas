import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, NgForm, FormsModule, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CKEditorModule, loadCKEditorCloud, CKEditorCloudResult, ChangeEvent } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, EditorConfig } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';
import { environment } from '../../environments/environment';
import { ResourcesService } from './resources.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer } from '@angular/platform-browser';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-add-resources',
  imports: [ReactiveFormsModule, CommonModule, CKEditorModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule],
  template: `
    <div class="mx-10">
    @if (!form.valid && form.touched && $errorMessage()) {
    <div class="mb-5 text-white bg-red-600 rounded-md p-5">
        <span [innerHTML]="$errorMessage()"></span>
    </div>
    }
    @if ($successMessage()) {
    <div class="mb-5 text-white bg-green-600 rounded-md p-5 flex justify-between">
        <span>{{$successMessage()}}</span>
        <span class="cursor-pointer" (click)="clearSuccessMessage()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </span>
    </div>
    }
    <form [formGroup]="form" (ngSubmit)="go()" class="flex flex-col gap-5">
      <mat-form-field class="example-full-width">
      <mat-label>Title</mat-label>
      <input type="text" matInput [formControl]="form.controls.title" [errorStateMatcher]="matcher"
            placeholder="Title">
      @if (form.controls.title.hasError('required')) {
        <mat-error>Title is <strong>required</strong></mat-error>
      }
      </mat-form-field>
      @if (editor && config) {
          <ckeditor
              [editor]="editor"
              [config]="config"
              [data]="$contentInitial()"
              (change)="contentChange($event)">
          </ckeditor>
        }
        <div class="mt-3">
          <mat-radio-group [formControl]="form.controls.accessType" aria-label="Select an option">
            <mat-radio-button name="accessType" value="0">private</mat-radio-button>
            <mat-radio-button class="ml-8" name="accessType" value="1">public</mat-radio-button>
          </mat-radio-group>
        </div>
      <div class="mt-3">
        <input class="" type="file" multiple [formControl]="form.controls.resources" (change)="pickup_file($event)"/>
      </div>
      <div>
      <button class="bg-blue-500 text-white py-2 px-4 rounded-md" type="submit">
        Submit
      </button>
      </div>

    </form>
  `,
  styles: ``
})
export class AddResourcesComponent {
  $contentInitial = signal<string>('');
  $contentData = signal<string>('');
  $sanitizer = inject(DomSanitizer);
  $errorMessage = signal<string>('');
  $successMessage = signal<string>('');

  public editor: typeof ClassicEditor | null = null;

  public config: EditorConfig | null = null;

  constructor() {
    loadCKEditorCloud({
      version: '44.0.0',
      premium: true
    }).then(this._setupEditor.bind(this));
  }

  matcher = new MyErrorStateMatcher();

  private _setupEditor(cloud: CKEditorCloudResult<{ version: '44.0.0', premium: true }>) {
    const {
      ClassicEditor,
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Heading,
      FontFamily,
      FontSize,
      FontColor,
      FontBackgroundColor,
      Link,
      BlockQuote, CodeBlock, ImageInsertUI, ImageUpload, Indent, List, ListEditing, ListUI, ListUtils, TodoList, Strikethrough, Subscript, Superscript, Code
    } = cloud.CKEditor;

    this.editor = ClassicEditor;
    this.config = {
      licenseKey: environment.CKEDITOR_LICENSE,
      plugins: [Essentials, Paragraph, Bold, Italic, Heading, FontFamily, FontSize, FontColor, FontBackgroundColor, Link, BlockQuote, CodeBlock, ImageInsertUI, ImageUpload, Indent, List, TodoList, Strikethrough, Subscript, Superscript, Code,
        ListEditing, ListUI, ListUtils
      ],
      toolbar: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
        '|',
        'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
        '|',
        'link', 'blockQuote', 'codeBlock',
        '|',
        'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
      ]
    };
  }

  #resources_files: File[] = [];
  #resourceService = inject(ResourcesService);
  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    'title': ['', Validators.required],
    'content': [''],
    'accessType': ['', Validators.required],
    'resources': [''],
  });

  pickup_file(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      for (let i = 0; i < input.files.length; i++) {
        this.#resources_files.push(input.files[i]);
      }
    }
  }

  contentChange({ editor }: ChangeEvent) {
    this.$contentData.set(editor.getData());
  }

  go() {
    const formData = new FormData();
    formData.append('title', this.form.controls.title.value);
    formData.append('content', this.$contentData());
    formData.append('accessType', this.form.controls.accessType.value);
    for (let i = 0; i < this.#resources_files.length; i++) {
      formData.append('resources', this.#resources_files[i]);
    }
    this.#resourceService.addResource(formData).subscribe(response => {
      if (response.success) {
        this.form.reset();
        this.form.controls.title.reset();
        this.$successMessage.set("Resource added successfully");
      } else {
        this.$errorMessage.set(response.message ?? "Something went wrong in server");
      }
    });
  }

  clearSuccessMessage() {
    this.$successMessage.set('');
  }
}