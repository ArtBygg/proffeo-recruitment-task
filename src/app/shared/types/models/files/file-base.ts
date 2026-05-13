export class FileBase {
  public type: string | undefined;
  public orderNo: number;

  public isImage(): boolean {
    const supportedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/avif',
      'image/apng',
      'image/svg',
      'image/webp'
    ];

    return supportedImageTypes.includes(this.type);
  }

  public isPdf(): boolean {
    return this.type === 'application/pdf';
  }

  public isVideo(): boolean {
    return ['video/quicktime', 'video/mp4'].includes(this.type);
  }
}
