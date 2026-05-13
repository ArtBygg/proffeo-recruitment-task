import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  OnChanges,
  output,
  Signal,
  signal,
  viewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DeviceService } from '@app/shared/services/shared/device.service';
import { Task } from '@app/shared/types/models/task/task.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'proffeo-task-details-description',
  templateUrl: './task-details-description.component.html',
  imports: [TranslateModule, MatIconModule, EditorComponent, NgClass]
})
export class TaskDetailsDescriptionComponent implements AfterViewInit, OnChanges {
  private readonly deviceService = inject(DeviceService);

  private originalDescription = signal('');
  private currentDescription = signal('');

  private editorInitialized = false;

  protected readonly isMobile: Signal<boolean> = this.deviceService.isMobile;

  public task = input<Task | null>();
  public createMode = input<boolean>(false);
  public minHeight = input<string>('150');

  public editorComponent = viewChild(EditorComponent);
  public descriptionChange = output<string>();

  public contentChanged = computed(() => {
    const original = this.originalDescription();
    const current = this.currentDescription();

    if (!original && !current) return false;

    const editor = this.editorComponent();
    if (!editor) return false;

    if (original !== current) {
      if (editor.editor.getText() === this.stripHtml(original)) {
        return false;
      }
      return true;
    }

    return false;
  });

  public ngOnChanges(): void {
    if (this.editorInitialized) {
      this.initEditorContent();
    }
  }

  public ngAfterViewInit(): void {
    const editor = this.editorComponent();
    if (editor && !this.editorInitialized) {
      this.editorInitialized = true;
      editor.editor.on('update', () => {
        const newContent = editor.editor.getHTML();
        this.currentDescription.set(newContent);

        if (this.createMode()) {
          this.descriptionChange.emit(newContent);
        }
      });

      this.initEditorContent();
    }
  }

  private initEditorContent(): void {
    const editor = this.editorComponent();
    const task = this.task();
    if (!editor || !task) return;

    const description = task.description || '';
    this.originalDescription.set(description);
    this.currentDescription.set(description);

    editor.editor.commands.setContent(description);
  }

  protected revertDesc(): void {
    const editor = this.editorComponent();
    if (!editor) return;
    const original = this.originalDescription();
    editor.editor.commands.clearContent();
    editor.editor.commands.insertContent(original);
    this.currentDescription.set(original);
  }

  protected updateDescription(): void {
    const task = this.task();
    if (!task?.id) return;
    const newDesc = this.currentDescription();
    this.descriptionChange.emit(newDesc);
    this.originalDescription.set(newDesc);
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
