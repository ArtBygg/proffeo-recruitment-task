import { TaskAttachmentsDetails } from '@app/shared/types/models/pdf/task-details/task-attachments-details.model';
import { TaskDetailsItems } from '@app/shared/types/models/pdf/task-details/task-details-items.model';

export interface Sections {
  taskDetails: boolean;
  taskDetailsItems: TaskDetailsItems;
  taskDescription: boolean;
  taskTimeline: boolean;
  taskAttachments: TaskAttachmentsDetails;
}
