/** Public video record stays {video,thumbnail,duration}; drafts never enter the DB. */
export const VIDEO_THUMB_RATIO = 3 / 4;
export const MAX_VIDEO_BYTES = 45 * 1024 * 1024; // Under Supabase Free 50MB global ceiling.
export const MAX_THUMB_BYTES = 1_500_000;
export const ACCEPTED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const VIDEO_CHUNK_BYTES = 6 * 1024 * 1024;

export function videoDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.round(seconds);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' +
    String(total % 60).padStart(2, '0');
}
export function isVideoHeader(mime, hex) {
  const head = String(hex || '').toLowerCase();
  if (mime === 'video/webm') return head.startsWith('1a45dfa3');
  if (mime === 'video/mp4' || mime === 'video/quicktime') {
    return /^[0-9a-f]{8}66747970/.test(head); // ISO BMFF ftyp at offset 4
  }
  return false;
}
export function validateVideoSelection({ size, type, headerHex }) {
  if (!ACCEPTED_VIDEO_MIMES.includes(type)) return 'MP4, WebM ya MOV video chunen.';
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_VIDEO_BYTES) {
    return 'Video 45 MiB se chhota hona chahiye (Supabase global limit).';
  }
  if (!isVideoHeader(type, headerHex)) return 'Video file signature unsupported or invalid.';
  return '';
}
export function validateVideoEntries(entries) {
  if (!Array.isArray(entries)) return 'Videos must be an array.';
  for (const item of entries) {
    if (!item || typeof item !== 'object' ||
        typeof item.video !== 'string' || !item.video ||
        typeof item.thumbnail !== 'string' || !item.thumbnail ||
        typeof item.duration !== 'string' || !/^\d{2,}:\d{2}$/.test(item.duration)) {
      return 'Every video needs its original URL, thumbnail, and duration.';
    }
  }
  return '';
}
export function videoMediaPath(url, workerId) {
  if (typeof url !== 'string' || !workerId) return null;
  try {
    const parsed = new URL(url);
    if (!/^https:$/.test(parsed.protocol)) return null;
    const match = parsed.pathname.match(/^\/storage\/v1\/object\/public\/worker-media\/(.+)$/);
    if (!match) return null;
    const path = decodeURIComponent(match[1]);
    if (!path.startsWith(workerId + '/')) return null;
    if (path.includes('..') || path.includes('\\') || parsed.search || parsed.hash) return null;
    return path;
  } catch { return null; }
}
export function videoListChanged(previous, next) {
  return JSON.stringify(previous || []) !== JSON.stringify(next || []);
}
