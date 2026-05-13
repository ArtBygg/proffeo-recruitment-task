export class FileMetadata {
  public description: string | undefined;
  public fileTags: string[] | undefined;
  public orderNo: number;

  public constructor(value: Partial<FileMetadata>) {
    Object.assign(this, value);
  }
}

export class FileMetadataInfo extends FileMetadata {
  public id: string;

  public constructor(value: Partial<FileMetadataInfo>) {
    super(value);
    Object.assign(this, value);
  }
}

export class FileWithMetadata extends FileMetadata {
  public file: File | undefined;

  public constructor(value: Partial<FileWithMetadata>) {
    super(value);
    Object.assign(this, value);
  }
}
