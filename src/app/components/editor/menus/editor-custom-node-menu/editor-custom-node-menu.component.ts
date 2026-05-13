import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import isCustomNodeSelected, { isTableGripSelected } from '@app/components/editor/utils/isCustomNodeSelected';
import { Editor } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { TiptapBubbleMenuDirective } from 'ngx-tiptap';

@Component({
  selector: 'proffeo-editor-custom-node-menu',
  templateUrl: './editor-custom-node-menu.component.html',
  imports: [TiptapBubbleMenuDirective, MatTooltip, MatIconModule]
})
export class EditorCustomNodeMenuComponent {
  public editor = input.required<Editor>();

  protected get isAlignLeft(): boolean {
    return this.editor().isActive({ textAlign: 'left' });
  }

  protected get isAlignCenter(): boolean {
    return this.editor().isActive({ textAlign: 'center' });
  }

  protected get isAlignRight(): boolean {
    return this.editor().isActive({ textAlign: 'right' });
  }

  protected get isAlignJustify(): boolean {
    return this.editor().isActive({ textAlign: 'justify' });
  }

  protected shouldShowMenu({
    editor,
    view,
    from
  }: {
    editor: Editor;
    view: EditorView;
    state: EditorState;
    oldState?: EditorState;
    from: number;
    to: number;
  }): boolean {
    if (!view || editor.view.dragging) {
      return false;
    }

    // TODO: some resizing state on the image node so it hides the menu when we resize the image temporarily?

    const domAtPos: HTMLElement = view.domAtPos(from || 0).node as HTMLElement;
    const nodeDOM: HTMLElement = view.nodeDOM(from || 0) as HTMLElement;
    const node: HTMLElement = nodeDOM || domAtPos;

    return isCustomNodeSelected(editor, node) && !isTableGripSelected(node);
  }

  protected setAlignment(alignment: 'left' | 'center' | 'right' | 'justify'): void {
    this.editor().chain().focus().setTextAlign(alignment).run();
  }
}
