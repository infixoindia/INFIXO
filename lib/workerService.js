/**
 * Infixo Worker Service & Canonical Schema Mapper
 * Handles mapping between Supabase database (snake_case) 
 * and Canonical UI Model (camelCase).
 */

export const EMPTY_WORKER_SCHEMA = {
  id: "",
  slug: "",
  fullName: "",
  profession: "",
  workerCode: "",
  category: "Home Services",
  location: "",
  gender: "Male",
  age: "",
  address: "",
  languages: ["Hindi"],
  profileImage: "/images/avatar.jpg",
  heroSlides: [],
  experience: 0,
  primarySkill: "",
  services: [],
  workingHours: "09:00 AM – 07:00 PM",
  workingShift: { day: true, night: false },
  serviceArea: [],
  whyChooseMe: [],
  photos: [],
  videos: [],
  about: [],
  // Fixed Verification System
  isVerified: true,
  verifications: {
    identityVerified: true,
    workVerified: true,
    addressVerified: true,
  },
};

/**
 * Transforms raw Supabase Database record to UI Canonical Object
 */
export function mapDatabaseToWorker(dbRecord) {
  if (!dbRecord) return EMPTY_WORKER_SCHEMA;

  return {
    id: dbRecord.id || "",
    slug: dbRecord.slug || "",
    fullName: dbRecord.full_name || dbRecord.name || "",
    profession: dbRecord.profession || "",
    workerCode: dbRecord.worker_code || "",
    category: dbRecord.category || "Home Services",
    location: dbRecord.location || "",
    gender: dbRecord.gender || "Male",
    age: dbRecord.age || "",
    address: dbRecord.address || "",
    languages: Array.isArray(dbRecord.languages) ? dbRecord.languages : ["Hindi"],
    profileImage: dbRecord.profile_image || "/images/avatar.jpg",
    heroSlides: Array.isArray(dbRecord.hero_slides) ? dbRecord.hero_slides : [],
    experience: dbRecord.experience || 0,
    primarySkill: dbRecord.primary_skill || "",
    services: Array.isArray(dbRecord.services) ? dbRecord.services : [],
    workingHours: dbRecord.working_hours || "09:00 AM – 07:00 PM",
    workingShift: dbRecord.working_shift || { day: true, night: false },
    serviceArea: Array.isArray(dbRecord.service_area) ? dbRecord.service_area : [],
    whyChooseMe: Array.isArray(dbRecord.why_choose_me) ? dbRecord.why_choose_me : [],
    photos: Array.isArray(dbRecord.photos) ? dbRecord.photos : [],
    videos: Array.isArray(dbRecord.videos) ? dbRecord.videos : [],
    about: Array.isArray(dbRecord.about) ? dbRecord.about : [],
    // Verification remains fixed
    isVerified: dbRecord.is_verified ?? true,
    verifications: dbRecord.verifications || {
      identityVerified: true,
      workVerified: true,
      addressVerified: true,
    },
  };
}

/**
 * Transforms UI Canonical Object to Supabase Payload for Insert/Update
 */
export function mapWorkerToDatabase(worker) {
  return {
    full_name: worker.fullName,
    profession: worker.profession,
    worker_code: worker.workerCode,
    category: worker.category,
    location: worker.location,
    gender: worker.gender,
    age: worker.age,
    address: worker.address,
    languages: worker.languages,
    profile_image: worker.profileImage,
    hero_slides: worker.heroSlides,
    experience: Number(worker.experience) || 0,
    primary_skill: worker.primarySkill,
    services: worker.services,
    working_hours: worker.workingHours,
    working_shift: worker.workingShift,
    service_area: worker.serviceArea,
    why_choose_me: worker.whyChooseMe,
    photos: worker.photos,
    videos: worker.videos,
    about: worker.about,
    // Verification fields preserved
    is_verified: worker.isVerified,
    verifications: worker.verifications,
  };
}
