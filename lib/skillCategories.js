/**
 * Central Skill Category Registry
 * ================================
 * Single source of truth for every "Primary Skill" category used across
 * the app (Admin dropdown + public Worker Profile icon).
 *
 * Worker records store ONLY the `slug` (e.g. "electrician") in
 * worker.primarySkill — never the label or icon itself. This file is the
 * only place that maps a slug -> category presentation.
 *
 * Categories with a custom image use `image`; categories without one may
 * continue to use an inline SVG `Icon`.
 */

function GenericSkillIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" />
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

export const SKILL_CATEGORIES = [
  {
    slug: "electrician",
    label: "Electrician",
    image: "/images/category-electrician.png",
  },
  {
    slug: "painter",
    label: "Painter",
    image: "/images/category-painter.png",
  },
  {
    slug: "plumber",
    label: "Plumber",
    image: "/images/category-plumber.png",
  },
  { slug: "pandit", label: "Pandit", Icon: PanditIcon },
];

const BY_SLUG = Object.fromEntries(SKILL_CATEGORIES.map((c) => [c.slug, c]));
const BY_LABEL_LOWER = Object.fromEntries(
  SKILL_CATEGORIES.map((c) => [c.label.toLowerCase(), c])
);

export function resolveSkillCategory(value) {
  const raw = (value || "").trim();
  if (!raw) return null;

  const normalized = raw.toLowerCase();
  const bySlug = BY_SLUG[normalized];
  if (bySlug) return bySlug;

  const byLabel = BY_LABEL_LOWER[normalized];
  if (byLabel) return byLabel;

  return { slug: normalized, label: raw, Icon: GenericSkillIcon };
}
