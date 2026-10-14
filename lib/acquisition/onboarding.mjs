import {normalizePhone,profileLimitError} from './config.mjs';
export function profileUrl(worker) {
 return worker?.is_active && typeof worker.full_name==='string' && worker.full_name.trim() && typeof worker.slug==='string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(worker.slug)
  ? `/w/${encodeURIComponent(worker.slug)}` : null;
}
export function onboardingError(worker,lead,plan,profession) {
 if(!worker)return 'Worker profile nahi mili.';
 if(!profileUrl(worker))return 'Complete active worker profile required. Minimal staging dependency rows cannot complete onboarding.';
 if(normalizePhone(worker.phone)!==lead.phone)return 'Worker phone aur registration phone match nahi karte. Sahi profile link karein.';
 if(worker.profession!==lead.profession || profession!==lead.profession)return 'Worker category aur original registration category match honi chahiye.';
 return profileLimitError(worker,plan);
}
