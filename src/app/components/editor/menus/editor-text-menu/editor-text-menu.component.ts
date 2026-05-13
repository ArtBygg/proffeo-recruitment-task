import { Component, ElementRef, input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import isCustomNodeSelected from '@app/components/editor/utils/isCustomNodeSelected';
import isTextSelected from '@app/components/editor/utils/isTextSelected';
import { Editor } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { ColorPickerDirective } from 'ngx-color-picker';
import { TiptapBubbleMenuDirective } from 'ngx-tiptap';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'proffeo-editor-text-menu',
  templateUrl: './editor-text-menu.component.html',
  imports: [TiptapBubbleMenuDirective, MatTooltip, MatMenuModule, MatMenuTrigger, MatIconModule, ColorPickerDirective]
})
export class EditorTextMenuComponent {
  @ViewChild('colorBtn') private readonly colorBtn: ElementRef;

  protected pickerOpen: boolean = false;
  protected headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

  public editor = input.required<Editor>();

  protected get isBold(): boolean {
    return this.editor().isActive('bold');
  }

  protected get isItalic(): boolean {
    return this.editor().isActive('italic');
  }

  protected get isUnderlined(): boolean {
    return this.editor().isActive('underline');
  }

  protected get isStrikethrough(): boolean {
    return this.editor().isActive('strike');
  }

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

  protected get isBulletList(): boolean {
    return this.editor().isActive('bulletList');
  }

  protected get isOrderedList(): boolean {
    return this.editor().isActive('orderedList');
  }

  protected get isSubscript(): boolean {
    return this.editor().isActive('subscript');
  }

  protected get isSuperscript(): boolean {
    return this.editor().isActive('superscript');
  }

  protected get isHighlighted(): boolean {
    return this.editor().isActive('highlight');
  }

  protected shouldShowTextMenu({
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

    const domAtPos: HTMLElement = view.domAtPos(from || 0).node as HTMLElement;
    const nodeDOM: HTMLElement = view.nodeDOM(from || 0) as HTMLElement;
    const node: HTMLElement = nodeDOM || domAtPos;

    if (isCustomNodeSelected(editor, node)) {
      return false;
    }

    return isTextSelected({ editor });
  }

  protected colorChanged(color: string): void {
    this.editor().chain().focus().setColor(color).run();
  }

  protected toggleHeading(level: HeadingLevel): void {
    this.editor().chain().focus().toggleHeading({ level: level }).run();
  }

  protected isHeadingActive(level: HeadingLevel): boolean {
    return this.editor().isActive('heading', { level: level });
  }

  protected getCurrentHeadingLevel(): HeadingLevel | null {
    return this.editor().getAttributes('heading')['level'] as HeadingLevel | null;
  }

  protected handleUndo(): void {
    this.editor().chain().focus().undo().run();
  }

  protected handleRedo(): void {
    this.editor().chain().focus().redo().run();
  }

  protected toggleBold(): void {
    this.editor().chain().focus().toggleBold().run();
  }

  protected toggleItalic(): void {
    this.editor().chain().focus().toggleItalic().run();
  }

  protected toggleUnderline(): void {
    this.editor().chain().focus().toggleUnderline().run();
  }

  protected toggleStrikethrough(): void {
    this.editor().chain().focus().toggleStrike().run();
  }

  protected toggleHighlight(): void {
    this.editor().chain().focus().toggleHighlight().run();
  }

  protected setAlignment(alignment: 'left' | 'center' | 'right' | 'justify'): void {
    this.editor().chain().focus().setTextAlign(alignment).run();
  }

  protected toggleBulletList(): void {
    this.editor().chain().focus().toggleBulletList().run();
  }

  protected toggleOrderedList(): void {
    this.editor().chain().focus().toggleOrderedList().run();
  }

  protected toggleSubscript(): void {
    this.editor().chain().focus().toggleSubscript().run();
  }

  protected toggleSuperscript(): void {
    this.editor().chain().focus().toggleSuperscript().run();
  }
}
