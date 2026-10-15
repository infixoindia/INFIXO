/**
 * Server-side minimum requirements to manually publish a saved Worker Profile.
 *
 * The profile editor intentionally allows unfinished drafts and optional media.
 * This check does not require media or phone because existing real INFIXO profiles
 * and non-acquisition profiles may not have either. For acquired workers,
 * onboarding approval separately verifies matching phone and plan media limits.
 *
 * Never infer that publishing a profile means the corresponding acquisition
 * lead has been approved. Those are separate explicit admin actions.
 */
export function activationError(worker) {
  if (!worker) return "Worker profile nahi mili.";
  if (typeof worker.full_name !== "string" || worker.full_name.trim().length < 2) {
    return "Activate karne se pehle worker ka poora naam bharein.";
  }
  if (typeof worker.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(worker.slug)) {
    return "Activate karne se pehle valid profile slug save karein.";
  }
  if (typeof worker.profession !== "string" || !worker.profession.trim()) {
    return "Activate karne se pehle worker ki profession select karein.";
  }
  if (!Array.isArray(worker.service_area) ||
      !worker.service_area.some(area => typeof area === "string" && area.trim())) {
    return "Activate karne se pehle kam se kam ek service area save karein.";
  }
  return null;
}
