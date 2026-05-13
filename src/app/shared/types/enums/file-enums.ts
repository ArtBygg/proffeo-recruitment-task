export enum FileContext {
  standalone,
  projectDraftAvatar,
  // projectFile,
  locationFile,
  taskFile,
  taskCommentFile,
  taskDescriptionFile,
  //taskNoteFile,
  timeReportFile
  // userFile
}

export enum UploadStatus {
  Requested,
  Canceled,
  Failure,
  Started,
  Completed
}
