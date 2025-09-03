export const fileTypes = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  APPLICATION: "application",
};

export const allowedFilesExtensions = {
  [fileTypes.IMAGE]: ["jpg", "jpeg", "png", "gif", "bmp", "svg"],
  [fileTypes.VIDEO]: ["mp4", "avi", "mov", "wmv", "flv", "mkv"],
  [fileTypes.AUDIO]: ["mp3", "wav", "aac", "flac", "ogg"],
  [fileTypes.APPLICATION]: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
};
