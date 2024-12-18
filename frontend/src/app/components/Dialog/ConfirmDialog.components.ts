import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

/**
 * @title Dialog Animations
 */
@Component({
    selector: 'dialog-animations-example-dialog',
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <h2 mat-dialog-title>{{data.title}}</h2>
        <mat-dialog-content>
            {{data.content}}
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button mat-dialog-close (click)="onNoClick()">{{data.cancelText}}</button>
            <button class="delete-btn" mat-button mat-dialog-close cdkFocusInitial (click)="onOkClick()">{{data.confirmText}}</button>
        </mat-dialog-actions>
  `,
    styles: `.delete-btn {
    background-color: red;
    color: white;
  }`
})
export class ConfirmDialog {
    readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
    data = inject(MAT_DIALOG_DATA)

    confirmed = output<boolean>()

    // Method to handle No click (do nothing and close)
    onNoClick(): void {
        this.confirmed.emit(false);
        this.dialogRef.close();
    }

    // Method to handle Ok click (perform your custom logic)
    onOkClick(): void {
        this.confirmed.emit(true);
        this.dialogRef.close();
    }
    constructor() {
    }
}