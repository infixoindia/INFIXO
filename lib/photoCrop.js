// Photo framing helpers. The ORIGINAL image is never modified: a crop is only
// {x, y, zoom, ar} metadata stored next to the image URL in hero_slides.
//   x, y : point of the image (0..1) that sits at the CENTER of the frame
//   zoom : 1 = image just covers the frame, >1 = zoomed in
//   ar   : original image width / height
export const FRAME_RATIO = 16 / 10;

export function validCrop(c) {
  return !!c && [c.x, c.y, c.zoom, c.ar].every(Number.isFinite) && c.ar > 0 && c.zoom >= 1 && c.zoom <= 8 && c.x >= 0 && c.x <= 1 && c.y >= 0 && c.y <= 1;
}

export function coverSize(fw, fh, ar) {
  return fw / fh > ar ? { w: fw, h: fw / ar } : { w: fh * ar, h: fh };
}

// Keep the image covering the whole frame (no empty edges).
export function clampCrop(fw, fh, crop) {
  const { w, h } = coverSize(fw, fh, crop.ar);
  const W = w * crop.zoom, H = h * crop.zoom;
  const mx = Math.min(0.5, fw / (2 * W)), my = Math.min(0.5, fh / (2 * H));
  return { ...crop, x: Math.min(1 - mx, Math.max(mx, crop.x)), y: Math.min(1 - my, Math.max(my, crop.y)) };
}

// Pixel rectangle of the image inside a frame of fw x fh.
export function layoutCrop(fw, fh, crop) {
  const c = clampCrop(fw, fh, crop);
  const { w, h } = coverSize(fw, fh, c.ar);
  const W = w * c.zoom, H = h * c.zoom;
  return { left: fw / 2 - c.x * W, top: fh / 2 - c.y * H, width: W, height: H };
}

// Starting point = what the public hero shows today for an uncropped photo
// (object-fit: cover, object-position: center 15%).
export function defaultCrop(fw, fh, ar) {
  const { w, h } = coverSize(fw, fh, ar);
  const y = h > fh ? (fh / 2 + 0.15 * (h - fh)) / h : 0.5;
  return { x: 0.5, y, zoom: 1, ar };
}

export function sanitizeCrop(c) {
  if (!validCrop(c)) return null;
  const r = n => Math.round(n * 10000) / 10000;
  return { x: r(c.x), y: r(c.y), zoom: r(c.zoom), ar: r(c.ar) };
}
