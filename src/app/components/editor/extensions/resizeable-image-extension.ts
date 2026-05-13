import { Injector } from '@angular/core';
import { Node } from '@tiptap/core';
import { Image, ImageOptions } from '@tiptap/extension-image';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { ResizeableImageComponent } from './resizeable-image.component';

const ResizableImageExtension = (injector: Injector): Node<ImageOptions, unknown> => {
  return Image.extend({
    addAttributes(): Record<string, unknown> {
      return {
        ...this.parent?.(),
        width: { renderHTML: ({ width }) => ({ width }) as Record<string, unknown> },
        height: { renderHTML: ({ height }) => ({ height }) as Record<string, unknown> }
      };
    },
    addNodeView(): ReturnType<typeof AngularNodeViewRenderer> {
      return AngularNodeViewRenderer(ResizeableImageComponent, { injector });
    }
  }).configure({
    inline: true,
    allowBase64: false
  });
};

export default ResizableImageExtension;
