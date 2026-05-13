import { ProjectTaskDTO } from '../project-tasks/project-task.dto';
import { TaskImportValidationErrorDTO } from './task-import-validation-error.dto';

export interface ImportTasksResultDTO {
  batchId: string;
  success: boolean;
  errors: TaskImportValidationErrorDTO[];
  createdTasks: ProjectTaskDTO[];
}
