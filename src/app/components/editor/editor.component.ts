import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TableColumnMenuComponent } from '@app/components/editor/extensions/table/menus/table-column/table-column-menu.component';
import { TableRowMenuComponent } from '@app/components/editor/extensions/table/menus/table-row/table-row-menu.component';
import { EditorNewBlockMenuComponent } from '@app/components/editor/menus/editor-new-block-menu/editor-new-block-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { Editor } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { ListKeymap } from '@tiptap/extension-list-keymap';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import { Youtube } from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';

import { CommonModule } from '@angular/common';
import { DeviceService } from '@app/shared/services/shared/device.service';
import ResizableImageExtension from './extensions/resizeable-image-extension';
import { Table, TableCell, TableHeader, TableRow } from './extensions/table';
import { EditorCustomNodeMenuComponent } from './menus/editor-custom-node-menu/editor-custom-node-menu.component';
import { EditorTextMenuComponent } from './menus/editor-text-menu/editor-text-menu.component';

export interface FileUploadEvent {
  file: File;
  type: 'image' | 'file';
  onSuccess?: (url: string) => void;
  onError?: (error: unknown) => void;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    TiptapEditorDirective,
    MatTooltip,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TranslateModule,
    MatIconButton,
    EditorTextMenuComponent,
    EditorCustomNodeMenuComponent,
    EditorNewBlockMenuComponent,
    TableColumnMenuComponent,
    TableRowMenuComponent,
    MatIconModule
  ]
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer') private readonly editorContainer: ElementRef;

  private readonly injector: Injector = inject(Injector);
  private readonly deviceService: DeviceService = inject(DeviceService);
  private readonly fb: FormBuilder = inject(FormBuilder);

  private readonly _form: FormGroup = this.fb.group({
    text: new FormControl('')
  });

  protected readonly isMobile = this.deviceService.isMobile;

  public readonly valueChanged = output<string>();
  public readonly cancelled = output<void>();
  public readonly focused = output<void>();

  public mobileTaskDetailsMode: InputSignal<boolean> = input(false);
  public showMenu: InputSignal<boolean> = input(false);
  public showButtons: InputSignal<boolean> = input(false);
  public text: InputSignal<string> = input('');
  public minHeight: InputSignal<string> = input('auto');
  public maxHeight: InputSignal<string> = input('auto');

  public editor: Editor = new Editor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Placeholder.configure({
        placeholder: 'Write something …'
      }),

      ListKeymap,

      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Link,
      Highlight,
      Underline,
      Superscript,
      Subscript,
      Typography,
      Color,

      // DragHandle.configure({
      //   tippyOptions: {
      //     offset: [-2, 16],
      //     zIndex: 99
      //   },
      //   render: () => {
      //     const element = document.createElement('div')
      //
      //     // Use as a hook for CSS to insert an icon
      //     element.classList.add('custom-drag-handle')
      //
      //     return element
      //   }
      // }),

      Table.configure({
        allowTableNodeSelection: true,
        resizable: true,
        lastColumnResizable: false
      }),
      TableHeader,
      TableCell,
      TableRow,
      TaskItem,
      TaskList,
      ResizableImageExtension(this.injector),
      Youtube

      // FileHandler.configure({
      //   allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      //   onDrop: (currentEditor, files, pos) => {
      //     if (!this.fileUploadHandler) {
      //       return;
      //     }
      //
      //     files.forEach(file => {
      //       this.fileUploadHandler({
      //         file,
      //         type: 'image',
      //         onSuccess: url => {
      //           currentEditor
      //             .chain()
      //             .insertContentAt(pos, {
      //               type: 'image',
      //               attrs: {
      //                 src: url
      //               }
      //             })
      //             .focus()
      //             .run();
      //         }
      //       });
      //     });
      //   },
      //   onPaste: (currentEditor, files, htmlContent) => {
      //     if (!this.fileUploadHandler) {
      //       return;
      //     }
      //
      //     files.forEach((file: File) => {
      //       if (htmlContent) {
      //         // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
      //         // you could extract the pasted file from this url string and upload it to a server for example
      //         return;
      //       }
      //
      //       const pos: number = currentEditor.state.selection.anchor;
      //
      //       this.fileUploadHandler({
      //         file,
      //         type: 'image',
      //         onSuccess: url => {
      //           currentEditor
      //             .chain()
      //             .insertContentAt(pos, {
      //               type: 'image',
      //               attrs: {
      //                 src: url
      //               }
      //             })
      //             .focus()
      //             .run();
      //         }
      //       });
      //     });
      //   }
      // })
    ]
  });

  public constructor() {
    effect(() => {
      // Ten efekt synchronizuje sygnał wejściowy `text` z formularzem
      this._form.patchValue({ text: this.text() });
    });
  }

  protected get form(): FormGroup {
    return this._form;
  }

  protected cancel(): void {
    this._form.patchValue({ text: this.text() });
    this.cancelled.emit();
  }

  public ngOnInit(): void {
    this.editor.on('focus', () => {
      this.focused.emit();
    });
  }

  public ngOnDestroy(): void {
    this.editor.destroy();
  }

  public save(): void {
    this.valueChanged.emit(this.form.controls['text'].value);
  }
}
