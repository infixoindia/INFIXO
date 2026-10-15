export const PROFESSIONS_HI = ['पेंटर','प्लंबर','इलेक्ट्रिशियन','टेक्नीशियन','पंडित'];
export const MODELS_HI = ['मैं खुद काम करता हूँ','मैं सहायकों के साथ काम करता हूँ','मैं केवल अपनी टीम से काम करवाता हूँ'];
export const REASONS_HI = ['मुझे अपनी प्रोफाइल बनवानी है','मुझे प्रोफाइल के बारे में जानकारी चाहिए','मुझे कुछ पूछना है'];
export const PLAN_LABELS = {FREE:'FREE ₹0',PRO:'PRO ₹199','Not Decided':'अभी तय नहीं किया'};
export const FIELD_ERRORS = {name:'कृपया अपना नाम लिखें।',phone:'कृपया सही मोबाइल नंबर दर्ज करें।',profession:'कृपया अपना काम चुनें।',area:'कृपया अपना क्षेत्र बताएँ।',working_model:'कृपया बताएँ कि आप किस तरह काम करते हैं।',reason:'कृपया जुड़ने का कारण चुनें।',plan:'कृपया अपनी प्रोफाइल का प्लान चुनें।',consent:'आगे बढ़ने के लिए सहमति आवश्यक है।',question:'कृपया अपना सवाल 1000 अक्षरों तक लिखें।'};
export function referencePrice(plan, preview, campaign) {
 if (preview) return {amount:plan === 'FREE' ? 99 : 499, basis:'प्रस्तावित संदर्भ मूल्य — पुष्टि बाकी है'};
 const p=campaign.referencePrices?.[plan];
 return p?.verified === true && Number.isFinite(p.amount) && p.amount > (plan==='PRO'?199:0) && typeof p.basis === 'string' && p.basis.trim() ? p : null;
}
