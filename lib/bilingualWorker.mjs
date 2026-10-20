// Read old JSONB arrays and new Hindi/English objects without changing existing worker records.
const points = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

export function readBilingualSection(value) {
  if (Array.isArray(value)) return { hi: points(value), en: [] };
  if (!value || typeof value !== "object") return { hi: [], en: [] };
  return { hi: points(value.hi), en: points(value.en) };
}

// Keep the legacy array format until an English translation is actually saved.
// No database migration or destructive rewrite of existing profiles is needed.
export function writeBilingualSection(hindi, english) {
  const hi = points(hindi);
  const en = points(english);
  return en.length ? { hi, en } : hi;
}
