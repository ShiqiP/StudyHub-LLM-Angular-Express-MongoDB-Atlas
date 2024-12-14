import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../users/users.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CKEditorModule, loadCKEditorCloud, CKEditorCloudResult, ChangeEvent } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, EditorConfig } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';
import { environment } from '../../environments/environment';
import { ResourcesService } from './resources.service';

@Component({
  selector: 'app-add-resources',
  imports: [ReactiveFormsModule, CommonModule, CKEditorModule],
  template: `
    <div class="mx-10">
    <form [formGroup]="form" (ngSubmit)="go()">
      <div>
      <input class="border-2 border-black" placeholder="Title" [formControl]="form.controls.title"/>
      </div>
      <div>
      @if (editor && config) {
          <ckeditor
    [editor]="editor"
    [config]="config"
    [data]="$contentInitial()"
    (change)="contentChange($event)"
>
</ckeditor>
        }
      </div>
      <div>
        <input type="radio" id="private" name="fav_language" value="0">
        <label for="private">private</label><br>
        <input type="radio" id="public" name="fav_language" value="1">
        <label for="public">public</label><br>
      </div>
      <div>
        <input type="file" multiple [formControl]="form.controls.resources" (change)="pickup_file($event)"/>
      </div>
      <div>
      </div>
      <div>
        <button class="p-2 bg-blue-400">Go</button>
      </div>
    </form>
    </div>
  `,
  styles: ``
})
export class AddResourcesComponent {
  $contentInitial = signal<string>('<h1>Heading1</h1>');
  $contentData = signal<string>('');

  public editor: typeof ClassicEditor | null = null;

  public config: EditorConfig | null = null;

  constructor() {
    loadCKEditorCloud({
      version: '44.0.0',
      premium: true
    }).then(this._setupEditor.bind(this));
  }

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
        'link', 'uploadImage', 'blockQuote', 'codeBlock',
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
    'content': ['', Validators.required],
    'accessType': ['1', Validators.required],
    'resources': ['', Validators.required],
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

    console.log(this.$contentData());
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
      console.log(response);
    });
  }
}
