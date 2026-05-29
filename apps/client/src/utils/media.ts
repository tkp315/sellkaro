export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi|m4v)(\?|$)/i.test(url) || url.includes('/video/upload/');
}
