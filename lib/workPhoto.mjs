/**
 * A Work Photos entry is either a legacy URL string or an original-image URL
 * plus optional, non-destructive 3:4 gallery framing metadata.
 * Fullscreen viewer always uses the ORIGINAL source URL, never a cropped blob.
 */
export const WORK_PHOTO_FRAME_RATIO = 3 / 4;

export function workPhotoUrl(entry) {
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object' && typeof entry.image === 'string') return entry.image;
  return '';
}

export function workPhotoCrop(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  const crop = entry.crop;
  if (!crop || typeof crop !== 'object') return null;
  if (![crop.x, crop.y, crop.zoom, crop.ar].every(Number.isFinite)) return null;
  if (crop.x < 0 || crop.x > 1 || crop.y < 0 || crop.y > 1 || crop.zoom < 1 || crop.zoom > 8 || crop.ar <= 0) return null;
  return crop;
}

export function toWorkPhotoEntry(url, crop = null) {
  if (typeof url !== 'string' || !url.trim()) throw new Error('Work photo needs an original image URL');
  // Retain the original string representation for uncropped photos so existing
  // worker records and every old profile remain completely compatible.
  return crop ? { image: url, crop } : url;
}

export function workPhotoDisplay(entry) {
  return { src: workPhotoUrl(entry), crop: workPhotoCrop(entry) };
}
