import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Editor } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { TiptapBubbleMenuDirective } from 'ngx-tiptap';
import isRowGripSelected from './utils';

@Component({
  selector: 'proffeo-table-row-menu',
  templateUrl: './table-row-menu.component.html',
  imports: [TiptapBubbleMenuDirective, MatListModule]
})
export class TableRowMenuComponent {
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
    if (!state || !from) {
      return false;
    }

    return isRowGripSelected({ editor, view, state, from });
  }

  protected onAddRowBefore(): void {
    this.editor().chain().focus().addRowBefore().run();
  }

  protected onAddRowAfter(): void {
    this.editor().chain().focus().addRowAfter().run();
  }

  protected onDeleteRow(): void {
    this.editor().chain().focus().deleteRow().run();
  }
}
