import { NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { TiptapNodeViewWrapperDirective } from '@app/components/editor/directives/node-view-wrapper-directive';
import { AngularNodeViewComponent, TiptapDraggableDirective } from 'ngx-tiptap';

const MIN_WIDTH: number = 60;

@Component({
  selector: 'app-editor-resizeable-image',
  templateUrl: 'resizeable-image.component.html',
  imports: [NgStyle, TiptapNodeViewWrapperDirective, TiptapDraggableDirective]
})
export class ResizeableImageComponent extends AngularNodeViewComponent {
  @ViewChild('imgRef') protected imgRef!: ElementRef<HTMLImageElement>;
  @ViewChild('containerRef') protected containerRef!: ElementRef<HTMLDivElement>;

  private initialXPosition: number = 0;
  private currentWidth: number = 0;
  private direction: string = '';

  protected editing = false;
  protected resizingStyle: { width?: string } | undefined;

  @HostListener('document:click', ['$event'])
  private onClickOutside(event: MouseEvent): void {
    if (!this.containerRef?.nativeElement.contains(event.target as Node)) {
      this.editing = false;
    }
  }

  private mouseMoveHandler = (event: MouseEvent): void => {
    const transform = this.direction === 'w' ? -1 : 1;
    const newWidth = Math.max(this.currentWidth + transform * (event.clientX - this.initialXPosition), MIN_WIDTH);

    this.resizingStyle = { width: `${newWidth}px` };
  };

  private endResize = (): void => {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.endResize);

    if (this.resizingStyle?.width) {
      const updateAttributes = this.updateAttributes();
      updateAttributes({ width: parseInt(this.resizingStyle.width, 10) });
    }
    this.resizingStyle = undefined;
  };

  private touchMoveHandler = (event: TouchEvent): void => {
    const transform = this.direction[1] === 'w' ? -1 : 1;
    const newWidth = Math.max(
      this.currentWidth + transform * (event.touches[0].clientX - this.initialXPosition),
      MIN_WIDTH
    );

    this.resizingStyle = { width: `${newWidth}px` };
  };

  private endTouchResize = (): void => {
    document.removeEventListener('touchmove', this.touchMoveHandler);
    document.removeEventListener('touchend', this.endTouchResize);

    if (this.resizingStyle?.width) {
      const updateAttributes = this.updateAttributes();
      updateAttributes({ width: parseInt(this.resizingStyle.width, 10) });
    }
    this.resizingStyle = undefined;
  };

  protected toggleEditing(state: boolean): void {
    this.editing = state;

    if (state) {
      // Blur the editor to prevent iOS virtual keyboard from showing when clicking on our image node
      this.editor().commands.blur();
    }
  }

  protected startMouseResize(event: MouseEvent, direction: string): void {
    if (!this.imgRef) return;

    event.preventDefault();

    this.direction = direction;
    this.initialXPosition = event.clientX;
    this.currentWidth = this.imgRef.nativeElement.clientWidth;

    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.endResize);
  }

  protected startTouchResize(event: TouchEvent, direction: string): void {
    if (!this.imgRef) return;

    event.preventDefault();
    this.direction = direction;
    this.initialXPosition = event.touches[0].clientX;
    this.currentWidth = this.imgRef.nativeElement.clientWidth;

    document.addEventListener('touchmove', this.touchMoveHandler);
    document.addEventListener('touchend', this.endTouchResize);
  }
}
