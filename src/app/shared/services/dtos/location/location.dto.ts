import { FileDTO } from '../file/file.dto';

export interface LocationDTO {
  id: string;
  childrenCount: number;
  name: string;
  orderNo: number;
  parentId: string;
  projectId: string;
  readOnly: boolean;
  files: FileDTO[];
}
