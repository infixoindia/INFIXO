/**
 * Central Skill Category Registry
 * ================================
 * Single source of truth for every "Primary Skill" category used across
 * the app (Admin dropdown + public Worker Profile icon).
 *
 * Worker records store ONLY the `slug` (e.g. "electrician") in
 * worker.primarySkill — never the label or icon itself. This file is the
 * only place that maps a slug -> { label, Icon }. Changing a category's
 * icon or label here automatically updates every worker using that
 * category, with no per-worker edits and no Supabase Storage involved
 * (icons are plain inline SVG components).
 *
 * TO ADD A NEW CATEGORY LATER:
 *   Just add one more entry to SKILL_CATEGORIES below. The Admin "Primary
 *   Skill" dropdown and the public profile icon both pick it up
 *   automatically — no other file needs to change.
 */

// Generic fallback icon — used only if a worker's stored value doesn't
// match any known category slug (e.g. old free-text data that hasn't
// been re-selected in Admin yet).
function GenericSkillIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

function ElectricianIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" />
    </svg>
  );
}

function PainterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="3" width="16" height="5" rx="1.5" />
      <path d="M20 5.5h2v5a2 2 0 0 1-2 2h-8v3" />
      <path d="M12 15.5v5" strokeWidth="2.8" />
    </svg>
  );
}

function PlumberIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 3v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3" />
      <path d="M12 9v6" />
      <path d="M7 21v-4a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v4" />
      <path d="M7 21h10" />
    </svg>
  );
}

function PanditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v4" />
      <path d="M8 6h8l2 6H6l2-6Z" />
      <path d="M6 12v2a6 6 0 0 0 12 0v-2" />
      <path d="M4 21h16" />
    </svg>
  );
}

// ---------------------------------------------------------------------
// THE REGISTRY — add new categories here only.
// ---------------------------------------------------------------------
export const SKILL_CATEGORIES = [
  { slug: "electrician", label: "Electrician", Icon: ElectricianIcon },
  { slug: "painter", label: "Painter", Icon: PainterIcon },
  { slug: "plumber", label: "Plumber", Icon: PlumberIcon },
  { slug: "pandit", label: "Pandit", Icon: PanditIcon },
];

const BY_SLUG = Object.fromEntries(SKILL_CATEGORIES.map((c) => [c.slug, c]));
// Backward-compatibility lookup for old free-text values that were typed
// before this registry existed (e.g. "Painter", "painter ", "PAINTER").
const BY_LABEL_LOWER = Object.fromEntries(
  SKILL_CATEGORIES.map((c) => [c.label.toLowerCase(), c])
);

/**
 * Resolves any stored primarySkill value (ideally a slug, but tolerant of
 * legacy free text) to { slug, label, Icon }. Never throws. Falls back to
 * a generic icon + the raw stored text if nothing matches, so old worker
 * data never breaks the UI.
 */
export function resolveSkillCategory(value) {
  const raw = (value || "").trim();
  if (!raw) return null;

  const normalized = raw.toLowerCase();
  const bySlug = BY_SLUG[normalized];
  if (bySlug) return bySlug;

  const byLabel = BY_LABEL_LOWER[normalized];
  if (byLabel) return byLabel;

  // Unknown value (legacy free text that doesn't match any category) —
  // still show something sensible instead of breaking.
  return { slug: normalized, label: raw, Icon: GenericSkillIcon };
}
