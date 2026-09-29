/**
 * Infixo Worker Service & Canonical Schema Mapper
 * Public profile reads use the controlled public_worker_profiles view.
 * Admin CRUD uses the server-side /api/admin/workers endpoints.
 */

import { supabase } from "./supabaseClient";

export const EMPTY_WORKER_SCHEMA = {
  id: "", slug: "", ipuc: "", workerId: "", fullName: "", profession: "",
  experience: 0, serviceArea: [], heroSlides: [], phone: "", primarySkill: "",
  services: [], workingHours: "9:00 AM – 7:00 PM",
  workingShift: { day: true, night: false }, whyChooseMe: [], gender: "Male",
  age: "", address: "", languages: ["Hindi"], about: [],
  verifications: { identityVerified: false, workVerified: false, addressVerified: false },
  photos: [], videos: [],
};

export function mapDatabaseToWorker(row) {
  if (!row) return null;
  return {
    id: row.id || "", slug: row.slug || "", ipuc: row.ipuc || "",
    workerId: row.worker_id || "", fullName: row.full_name || "",
    profession: row.profession || "", experience: row.experience ?? 0,
    serviceArea: Array.isArray(row.service_area) ? row.service_area : [],
    heroSlides: Array.isArray(row.hero_slides) ? row.hero_slides : [],
    phone: row.phone || "", primarySkill: row.primary_skill || "",
    services: Array.isArray(row.services) ? row.services : [],
    workingHours: row.working_hours || "9:00 AM – 7:00 PM",
    workingShift: row.working_shift || { day: true, night: false },
    whyChooseMe: Array.isArray(row.why_choose_me) ? row.why_choose_me : [],
    gender: row.gender || "Male", age: row.age || "", address: row.address || "",
    languages: Array.isArray(row.languages) ? row.languages : ["Hindi"],
    about: Array.isArray(row.about) ? row.about : [],
    verifications: row.verifications || { identityVerified: false, workVerified: false, addressVerified: false },
    isVerified: !!(row.verifications?.identityVerified || row.verifications?.workVerified || row.verifications?.addressVerified),
    photos: Array.isArray(row.photos) ? row.photos : [],
    videos: Array.isArray(row.videos) ? row.videos : [],
    isActive: row.is_active !== false,
  };
}

export function mapWorkerToDatabase(worker) {
  return {
    slug: worker.slug,
    full_name: worker.fullName,
    profession: worker.profession,
    experience: String(worker.experience ?? ""),
    service_area: worker.serviceArea,
    hero_slides: worker.heroSlides,
    phone: worker.phone || "",
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

export function slugify(text) {
  return (text || "").toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function adminRequest(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Admin request failed");
  return body;
}

export async function generateUniqueSlug(baseName, currentId = null) {
  const base = slugify(baseName) || "worker";
  let candidate = base;
  let counter = 2;
  while (true) {
    const qs = new URLSearchParams({ checkSlug: candidate });
    if (currentId) qs.set("excludeId", currentId);
    const result = await adminRequest(`/api/admin/workers?${qs.toString()}`);
    if (!result.exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

// ---------------- PUBLIC READS ----------------
export async function getWorkerByIpuc(ipuc) {
  const { data, error } = await supabase.from("public_worker_profiles").select("*").eq("ipuc", ipuc).maybeSingle();
  if (error) throw error;
  return mapDatabaseToWorker(data);
}

export async function getWorkerBySlug(slug) {
  const { data, error } = await supabase.from("public_worker_profiles").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return mapDatabaseToWorker(data);
}

// ---------------- ADMIN READ/WRITE ----------------
export async function getWorkerById(id) {
  const body = await adminRequest(`/api/admin/workers/${encodeURIComponent(id)}`);
  return mapDatabaseToWorker(body.worker);
}

export async function listWorkers() {
  const body = await adminRequest("/api/admin/workers");
  return (body.workers || []).map(mapDatabaseToWorker);
}

export async function createWorker(worker) {
  const body = await adminRequest("/api/admin/workers", {
    method: "POST", body: JSON.stringify(mapWorkerToDatabase(worker)),
  });
  return mapDatabaseToWorker(body.worker);
}

const FIELD_TO_COLUMN = {
  fullName: "full_name", profession: "profession", experience: "experience",
  serviceArea: "service_area", heroSlides: "hero_slides", phone: "phone",
  primarySkill: "primary_skill", services: "services", workingHours: "working_hours",
  workingShift: "working_shift", whyChooseMe: "why_choose_me", gender: "gender",
  age: "age", address: "address", languages: "languages", about: "about",
  verifications: "verifications", photos: "photos", videos: "videos",
};

export async function updateWorker(id, patch) {
  const cleanPatch = {};
  Object.keys(patch).forEach((key) => {
    const column = FIELD_TO_COLUMN[key];
    if (!column) return;
    cleanPatch[column] = patch[key];
  });
  const body = await adminRequest(`/api/admin/workers/${encodeURIComponent(id)}`, {
    method: "PATCH", body: JSON.stringify(cleanPatch),
  });
  return mapDatabaseToWorker(body.worker);
}

export async function setWorkerActive(id, isActive) {
  const body = await adminRequest(`/api/admin/workers/${encodeURIComponent(id)}`, {
    method: "PATCH", body: JSON.stringify({ is_active: !!isActive }),
  });
  return mapDatabaseToWorker(body.worker);
}

export async function deleteWorker(id) {
  await adminRequest(`/api/admin/workers/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}
