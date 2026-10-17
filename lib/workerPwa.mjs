// Worker-specific PWA data helpers. No database writes or browser access.
export function pickWorkerIconSlide(slides) {
  if (!Array.isArray(slides)) return null;
  return slides.find((slide) => slide?.pwaIcon === true && typeof slide.image === "string" && slide.image) ||
    slides.find((slide) => typeof slide?.image === "string" && slide.image) || null;
}

export function iconRevision(slide) {
  const source = JSON.stringify([slide?.image || "", slide?.pwaCrop || null]);
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function makeWorkerManifest(worker) {
  if (!worker || !worker.id || !worker.slug) throw new Error("Published worker required");
  const id = encodeURIComponent(String(worker.id));
  const slide = pickWorkerIconSlide(worker.hero_slides);
  const revision = iconRevision(slide);
  const name = String(worker.full_name || "My Profile").trim().slice(0, 60) || "My Profile";
  return {
    id: `/pwa/worker/${id}`,
    name: `${name} | INFIXO`,
    short_name: name.toLowerCase() === "infixo" ? "INFIXO" : `${name.split(/\s+/)[0].slice(0, 15)} | INFIXO`,
    description: "My professional INFIXO Worker Profile",
    start_url: `/pwa/worker/${id}`,
    // Per-worker app scope: never capture Admin, landing or customer links.
    scope: `/pwa/worker/${id}`,
    display: "standalone",
    background_color: "#061945",
    theme_color: "#061945",
    icons: [192, 512].map(size => ({
      src: `/api/pwa/icon/${id}/${size}?v=${revision}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
}

export function isSafeProfilePhotoUrl(raw, supabaseUrl) {
  if (typeof raw !== "string" || typeof supabaseUrl !== "string") return false;
  try {
    const image = new URL(raw);
    const origin = new URL(supabaseUrl).origin;
    return image.protocol === "https:" && image.origin === origin &&
      image.pathname.startsWith("/storage/v1/object/public/worker-media/") &&
      !image.username && !image.password;
  } catch { return false; }
}
