export const getFileIcon = (type: string): string => {
  switch (type) {
    case 'image/jpeg':
      return 'iconsmind:file_jpg';
    case 'image/png':
    case 'image/bmp':
    case 'image/gif':
      return 'iconsmind:file_pictures';
    case 'text/plain':
      return 'iconsmind:file_txt';
    case 'application/x-zip-compressed':
      return 'iconsmind:file_zip';
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'iconsmind:file_word';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'iconsmind:file_excel';
    case 'text/csv':
      return 'iconsmind:file_csv';
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'iconsmind:file_presentation';
    case 'video/mp4':
    case 'video/mpeg':
    case 'video/x-msvideo':
      return 'iconsmind:file_video';
    case 'audio/mpeg':
      return 'iconsmind:mp3_file';
    case 'text/html':
      return 'iconsmind:file_html';
    default:
      return 'iconsmind:file';
  }
};
