import { Directive, HostBinding } from '@angular/core';

// Helper directive since ngx-tiptap has it only for node view content
// See more https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views
@Directive({
  selector: '[tiptapNodeViewWrapper]'
})
export class TiptapNodeViewWrapperDirective {
  @HostBinding('attr.data-node-view-wrapper') public handle: string = '';
  @HostBinding('style.white-space') public whiteSpace: string = 'normal';
}
