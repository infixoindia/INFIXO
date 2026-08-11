/**
 * Infixo Worker Service & Canonical Schema Mapper
 * Handles mapping between Supabase database (snake_case)
 * and Canonical UI Model (camelCase), plus all CRUD operations.
 *
 * This is the ONLY place that talks to the `workers` table.
 * Every public page and every admin editor must go through here,
 * so the public UI and the admin preview can never drift apart.
 */

import { supabase } from "./supabaseClient";

export const EMPTY_WORKER_SCHEMA = {
  id: "",
  slug: "",
  fullName: "",
  profession: "",
  experience: 0,
  serviceArea: [],
  heroSlides: [],

  primarySkill: "",
  services: [],
  workingHours: "9:00 AM – 7:00 PM",
  workingShift: { day: true, night: false },
  whyChooseMe: [],

  gender: "Male",
  age: "",
  address: "",
  languages: ["Hindi"],
  about: [],

  verifications: {
    identityVerified: true,
    workVerified: true,
    addressVerified: true,
  },

  photos: [],
  videos: [],
};

/**
 * Transforms raw Supabase row -> UI Canonical Object
 */
export function mapDatabaseToWorker(row) {
  if (!row) return null;

  return {
    id: row.id || "",
    slug: row.slug || "",
    fullName: row.full_name || "",
    profession: row.profession || "",
    experience: row.experience || 0,
    serviceArea: Array.isArray(row.service_area) ? row.service_area : [],
    heroSlides: Array.isArray(row.hero_slides) ? row.hero_slides : [],

    primarySkill: row.primary_skill || "",
    services: Array.isArray(row.services) ? row.services : [],
    workingHours: row.working_hours || "9:00 AM – 7:00 PM",
    workingShift: row.working_shift || { day: true, night: false },
    whyChooseMe: Array.isArray(row.why_choose_me) ? row.why_choose_me : [],

    gender: row.gender || "Male",
    age: row.age || "",
    address: row.address || "",
    languages: Array.isArray(row.languages) ? row.languages : ["Hindi"],
    about: Array.isArray(row.about) ? row.about : [],

    verifications: row.verifications || {
      identityVerified: false,
      workVerified: false,
      addressVerified: false,
    },
    // Top identity-card badge shows if ANY verification is true
    isVerified: !!(
      row.verifications?.identityVerified ||
      row.verifications?.workVerified ||
      row.verifications?.addressVerified
    ),

    photos: Array.isArray(row.photos) ? row.photos : [],
    videos: Array.isArray(row.videos) ? row.videos : [],
  };
}

/**
 * Transforms UI Canonical Object -> Supabase row payload
 */
export function mapWorkerToDatabase(worker) {
  return {
    slug: worker.slug,
    full_name: worker.fullName,
    profession: worker.profession,
    experience: Number(worker.experience) || 0,
    service_area: worker.serviceArea,
    hero_slides: worker.heroSlides,

    primary_skill: worker.primarySkill,
    services: worker.services,
    working_hours: worker.workingHours,
    working_shift: worker.workingShift,
    why_choose_me: worker.whyChooseMe,

    gender: worker.gender,
    age: worker.age,
    address: worker.address,
    languages: worker.languages,
    about: worker.about,

    verifications: worker.verifications,

    photos: worker.photos,
    videos: worker.videos,
  };
}

/**
 * Turns "Amit Verma" into a URL-safe, unique-ish slug: "amit-verma"
 */
export function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Ensures a slug is unique by appending -2, -3, etc. if needed.
 * Pass the worker's own id (if editing) so it doesn't collide with itself.
 */
export async function generateUniqueSlug(baseName, currentId = null) {
  const base = slugify(baseName) || "worker";
  let candidate = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from("workers").select("id").eq("slug", candidate);
    const { data } = await query;
    const clash = (data || []).find((r) => r.id !== currentId);
    if (!clash) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

// ------------------------------------------------------------------
// CRUD
// ------------------------------------------------------------------

/** Get single worker by slug (public profile + admin edit screen) */
export async function getWorkerBySlug(slug) {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return mapDatabaseToWorker(data);
}

/** Get single worker by id (admin edit screen) */
export async function getWorkerById(id) {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return mapDatabaseToWorker(data);
}

/** List all workers (admin dashboard) */
export async function listWorkers() {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDatabaseToWorker);
}

/** Create a brand new worker row (Admin -> Add New Worker) */
export async function createWorker(worker) {
  const payload = mapWorkerToDatabase(worker);
  const { data, error } = await supabase
    .from("workers")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return mapDatabaseToWorker(data);
}

/**
 * Update an existing worker. `patch` is a partial canonical object —
 * only the fields you pass get updated (used by per-section Save buttons).
 * Note: slug is intentionally NOT changed here, per spec — editing content
 * must never change the worker's public URL.
 */
export async function updateWorker(id, patch) {
  const dbPatch = mapWorkerToDatabase({ ...EMPTY_WORKER_SCHEMA, ...patch });
  // Only send keys that were actually present in patch, so we don't
  // accidentally blank out fields from other sections.
  const allowedKeys = Object.keys(mapWorkerToDatabase(patch));
  const cleanPatch = {};
  allowedKeys.forEach((k) => {
    if (k in dbPatch) cleanPatch[k] = dbPatch[k];
  });

  const { data, error } = await supabase
    .from("workers")
    .update(cleanPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapDatabaseToWorker(data);
}

/** Delete a worker */
export async function deleteWorker(id) {
  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) throw error;
  return true;
}
