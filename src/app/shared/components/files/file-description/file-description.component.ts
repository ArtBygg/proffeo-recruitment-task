import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonType } from '../../button/button.types';

@Component({
  selector: 'proffeo-file-description',
  templateUrl: './file-description.component.html',
  imports: [TranslateModule, MatIcon, FormsModule, MatTooltipModule, CdkTextareaAutosize],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileDescriptionComponent {
  protected readonly ButtonType: typeof ButtonType = ButtonType;
  protected readonly MAX_DESCRIPTION_LENGTH: number = 50;
  protected readonly descriptionTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('descriptionTextarea');
  protected isEditing: WritableSignal<boolean> = signal(false);
  protected editedDescription: WritableSignal<string> = signal('');

  public readonly description: InputSignal<string> = input.required<string>();
  public readonly descriptionChange: OutputEmitterRef<string> = output<string>();

  public constructor() {
    effect(() => {
      if (!this.isEditing()) {
        return;
      }

      queueMicrotask(() => {
        const textarea = this.descriptionTextarea()?.nativeElement;
        if (!textarea) {
          return;
        }

        textarea.focus();
        const cursorPosition = textarea.value.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      });
    });
  }

  public startEdit(): void {
    this.editedDescription.set(this.description() || '');
    this.isEditing.set(true);
  }

  public cancelEdit(): void {
    this.isEditing.set(false);
    this.editedDescription.set(this.description() || '');
  }

  public saveEdit(): void {
    const newDescription = this.editedDescription().trim();
    this.descriptionChange.emit(newDescription);
    this.isEditing.set(false);
  }

  public onKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Escape') {
      this.cancelEdit();
    } else if (event.key === 'Enter') {
      this.saveEdit();
    }
  }
}
