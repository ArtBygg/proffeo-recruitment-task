import { TaskDetailsPdfContent } from '@app/shared/types/models/pdf/task-details/task-details-pdf-content.model';

export interface CreateTaskDetailsPdfModalData {
  title: string;
  description: string;
  data: TaskDetailsPdfContent;
  generateText: string;
  cancelText: string;
}
