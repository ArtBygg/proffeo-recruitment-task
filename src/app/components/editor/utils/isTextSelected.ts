import { Editor, isTextSelection } from '@tiptap/core';

export default function isTextSelected({ editor }: { editor: Editor }): boolean {
  const {
    state: {
      doc,
      selection,
      selection: { empty, from, to }
    }
  } = editor;

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock: boolean = !doc.textBetween(from, to).length && isTextSelection(selection);
  return !(empty || isEmptyTextBlock || !editor.isEditable);
}
