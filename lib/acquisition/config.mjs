import { copy, LANGUAGES } from './i18n.mjs';
export const CAMPAIGN = {
  id: 'diwali-2026',
  expiresAt: '2026-11-09T00:00:00+05:30',
  postExpiryMessage: 'दिवाली ऑफर समाप्त हो गया है। नई कीमत और प्रोफाइल की जानकारी के लिए संपर्क करें।',
  // Reference prices intentionally disabled until their genuine basis is documented.
  referencePrices: null,
};
export const CATEGORIES = [
  { name: 'Painter', target: 89, icon: '🎨' },
  { name: 'Plumber', target: 89, icon: '🔧' },
  { name: 'Electrician', target: 89, icon: '⚡' },
  { name: 'Technician', target: 87, icon: '🛠️' },
  { name: 'Pandit', target: 77, icon: '🕉️' },
];
export const PLANS = ['FREE', 'PRO', 'Not Decided'];
export const WORK_MODELS = ['Main Khud Kaam Karta Hoon', 'Main Helpers Ke Saath Kaam Karta Hoon', 'Main Sirf Team Manage Karta Hoon'];
export const REASONS = ['Mujhe INFIXO Profile Banwani Hai', 'Mujhe Profile Ke Baare Mein Jaanna Hai', 'Mera Koi Sawal Hai'];
export const STATUSES = ['New Leads', 'Contacted', 'Interested', 'Verification Pending', 'Profile Creation', 'Approved / Onboarded', 'Not Interested', 'Duplicate / Rejected'];
export const LIMITS = { FREE: { identity: 1, photos: 2, videos: 0 }, PRO: { identity: 2, photos: 6, videos: 4 } };
export function offerActive(now = Date.now()) { return now < Date.parse(CAMPAIGN.expiresAt); }
export function countdown(now) {
  let seconds = Math.max(0, Math.ceil((Date.parse(CAMPAIGN.expiresAt) - now) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}
export function normalizePhone(value) {
  let phone = String(value ?? '').replace(/[\s()-]/g, '');
  if (phone.startsWith('+91')) phone = phone.slice(3);
  else if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
  return /^[6-9]\d{9}$/.test(phone) ? phone : null;
}
export function attributionFrom(params) {
  const result = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref']) {
    const value = params.get(key);
    if (value) result[key] = value.replace(/[\u0000-\u001f<>]/g, '').slice(0, 150);
  }
  return result;
}
export function validateLead(body, now = Date.now()) {
  const language = LANGUAGES.includes(body?.preferred_language) ? body.preferred_language : 'hi';
  const errors = copy(language).errors;
  const fail = code => { const error = new Error(errors[code] || errors.invalid); error.code = code; throw error; };
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('invalid');
  const clean = (key, min, max) => {
    const v = typeof body[key] === 'string' ? body[key].trim() : '';
    if (v.length < min || v.length > max || /[\u0000-\u001f<>]/.test(v)) fail(key);
    return v;
  };
  const name = clean('name', 2, 100);
  const phone = normalizePhone(body.phone); if (!phone) fail('phone');
  if (!CATEGORIES.some(c=>c.name===body.profession)) fail('profession');
  const area = clean('area', 2, 120);
  for (const [field, valid] of [['working_model',WORK_MODELS.includes(body.working_model)],['reason',REASONS.includes(body.reason)],['plan',['FREE','PRO'].includes(body.plan)]]) if (!valid) fail(field);
  if (body.plan === 'PRO' && !offerActive(now)) fail('expired');
  if (body.consent !== true) fail('consent');
  const question = clean('question', 0, 1000);
  const attribution = attributionFrom(new URLSearchParams(typeof body.attribution === 'object' ? body.attribution : {}));
  if (LANGUAGES.includes(body.preferred_language)) attribution.preferred_language = body.preferred_language;
  return { name, area, phone, profession: body.profession, selected_plan: body.plan, working_model: body.working_model, reason: body.reason, question, attribution, consent: true, consent_version: 'join-2026-10-v1', campaign: CAMPAIGN.id, offered_price: body.plan === 'PRO' ? 199 : body.plan === 'FREE' ? 0 : null };
}
export function profileLimitError(worker, plan) {
  const limit = LIMITS[plan];
  if (!limit) return 'Pehle FREE ya PRO plan confirm karein.';
  if (!worker?.is_active) return 'Active worker profile required.';
  for (const [key, max] of [['hero_slides', limit.identity], ['photos', limit.photos], ['videos', limit.videos]]) {
    if (!Array.isArray(worker[key]) || worker[key].length > max) return `${key}: plan limit ${max} se zyada media ya invalid data.`;
  }
  return null;
}
