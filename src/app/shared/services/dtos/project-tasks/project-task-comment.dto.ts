import { FileDTO } from '../file/file.dto';
import { UserDTO } from '../user/user.dto';

export interface ProjectTaskCommentDTO {
  id: string;
  description: string;
  createdAt: string;
  createdBy: UserDTO;
  folderId: string;
  attachments: FileDTO[];
}
