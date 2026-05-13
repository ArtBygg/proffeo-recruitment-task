import { Directive, HostListener, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Directive({
  selector: '[appImagePopover]'
})
export class ImagePopoverDirective {
  private readonly dialog: MatDialog = inject(MatDialog);

  public readonly appImagePopover = input.required<{
    src: string;
    name: string;
    description?: string;
  }>();

  @HostListener('click') protected onClick(): void {
    // this.dialog.open(ImagePopoverComponent, {
    //   width: '100dvw',
    //   maxWidth: '100%',
    //   height: '100dvh',
    //   data: {
    //     src: this.appImagePopover.src,
    //     name: this.appImagePopover.name,
    //     desc: this.appImagePopover.description
    //   },
    //   panelClass: 'image-popover'
    // });
  }
}
