/**
 * Determines whether a given media URL or mediaType string represents a video file.
 */
export function isVideoMedia(mediaUrl, mediaType = "") {
  if (mediaType === "video") return true;
  if (!mediaUrl || typeof mediaUrl !== "string") return false;

  const isVideoExtension = /\.(mp4|webm|ogg|mov|m4v|avi)(\?.*)?$/i.test(mediaUrl);
  const isCloudinaryVideo = mediaUrl.includes("/video/upload/");

  return isVideoExtension || isCloudinaryVideo;
}

/**
 * Extracts file extension from a filename or URL.
 */
export function getFileExtension(filename = "") {
  if (!filename || typeof filename !== "string") return "";
  const cleanUrl = filename.split("?")[0];
  return cleanUrl.split(".").pop().toLowerCase();
}
