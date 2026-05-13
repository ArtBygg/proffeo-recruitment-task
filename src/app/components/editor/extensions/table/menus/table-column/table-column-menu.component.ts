import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Editor } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { TiptapBubbleMenuDirective } from 'ngx-tiptap';
import isColumnGripSelected from './utils';

@Component({
  selector: 'proffeo-table-column-menu',
  templateUrl: './table-column-menu.component.html',
  imports: [TiptapBubbleMenuDirective, MatListModule]
})
export class TableColumnMenuComponent {
  public editor = input.required<Editor>();

  protected shouldShowMenu({
    editor,
    view,
    state,
    from
  }: {
    editor: Editor;
    view: EditorView;
    state: EditorState;
    oldState?: EditorState;
    from: number;
    to: number;
  }): boolean {
    if (!state) {
      return false;
    }

    return isColumnGripSelected({ editor, view, state, from: from || 0 });
  }

  protected onAddColumnBefore(): void {
    this.editor().chain().focus().addColumnBefore().run();
  }

  protected onAddColumnAfter(): void {
    this.editor().chain().focus().addColumnAfter().run();
  }

  protected onDeleteColumn(): void {
    this.editor().chain().focus().deleteColumn().run();
  }
}
