import { Editor } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Youtube } from '@tiptap/extension-youtube';

export const isTableGripSelected = (node: HTMLElement): boolean => {
  let container: HTMLElement = node;

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn: Element = container && container.querySelector && container.querySelector('a.grip-column.selected');
  const gripRow: Element = container && container.querySelector && container.querySelector('a.grip-row.selected');

  if (gripColumn || gripRow) {
    return true;
  }

  return false;
};

export default function isCustomNodeSelected(editor: Editor, node: HTMLElement): boolean {
  const customNodes: string[] = [
    // TODO: add all custom node names
    Youtube.name,
    Link.name,
    Image.name
  ];

  return customNodes.some(type => editor.isActive(type)) || isTableGripSelected(node);
}
