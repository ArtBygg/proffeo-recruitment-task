import { Sections } from '@app/shared/types/models/pdf/task-details/sections.model';

export interface TaskDetailsPdfRequest {
  sections: Sections;
  fileName: string;
  language: string;
}
