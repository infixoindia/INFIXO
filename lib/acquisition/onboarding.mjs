import {normalizePhone,profileLimitError} from './config.mjs';

export function profileUrl(worker) {
 return worker?.is_active && typeof worker.full_name==='string' && worker.full_name.trim() && typeof worker.slug==='string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(worker.slug)
  ? `/w/${encodeURIComponent(worker.slug)}` : null;
}

/**
 * A lead can be linked to a draft Worker Profile while it is being completed,
 * but the linked profile must refer to the SAME person and category.
 * This check must run for EVERY linked-worker status, not only on approval.
 * The picker UI is only a convenience; the Admin API enforces this.
 */
export function linkingError(worker, lead, profession) {
 if (!worker) return 'Worker profile nahi mili.';
 const leadPhone = normalizePhone(lead?.phone);
 if (!leadPhone || normalizePhone(worker.phone) !== leadPhone)
  return 'Worker phone aur registration phone match nahi karte. Sahi profile link karein.';
 if (worker.profession !== lead?.profession || profession !== lead?.profession)
  return 'Worker category aur original registration category match honi chahiye.';
 return null;
}

export function onboardingError(worker, lead, plan, profession) {
 const linkIssue = linkingError(worker, lead, profession);
 if (linkIssue) return linkIssue;
 if (!profileUrl(worker))
  return 'Complete active worker profile required. Draft or incomplete profiles cannot complete onboarding.';
 return profileLimitError(worker, plan);
}
