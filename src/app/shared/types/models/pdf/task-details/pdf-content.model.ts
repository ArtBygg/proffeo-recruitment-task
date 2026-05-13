import { PdfContentName } from '@app/shared/types/enums/pdf/task-details/pdf-contant-name.model';

export interface PdfContent {
  id: number;
  name: PdfContentName;
  checked: boolean;
}
