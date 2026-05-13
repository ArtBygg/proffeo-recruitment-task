export interface FileDTO {
  id: string;
  name?: string;
  size: number;
  type?: string;
  orderNo: number;
  createdAt?: Date;
  createdBy?: string;
  descriptionUpdatedById?: string;
  descriptionUpdatedOn?: Date;
  description?: string;
  fileShortId?: string;
}
