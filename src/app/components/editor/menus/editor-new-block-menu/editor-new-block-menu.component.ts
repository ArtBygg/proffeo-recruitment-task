import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Editor } from '@tiptap/core';
import { TiptapFloatingMenuDirective } from 'ngx-tiptap';

@Component({
  selector: 'proffeo-editor-new-block-menu',
  templateUrl: './editor-new-block-menu.component.html',
  imports: [TiptapFloatingMenuDirective, MatTooltip, MatIconModule]
})
export class EditorNewBlockMenuComponent {
  public editor = input.required<Editor>();
  public imageSelected = output<File>();

  protected toggleBulletList(): void {
    this.editor().chain().focus().toggleBulletList().run();
  }

  protected toggleOrderedList(): void {
    this.editor().chain().focus().toggleOrderedList().run();
  }
}
