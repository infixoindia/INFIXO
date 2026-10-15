import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN, CATEGORIES, PLANS, WORK_MODELS, REASONS, countdown, offerActive, validateLead, normalizePhone, attributionFrom, profileLimitError } from '../lib/acquisition/config.mjs';
const before = Date.parse('2026-11-08T23:59:59+05:30');
const lead = { name:'Synthetic Worker', phone:'9000000000', profession:'Painter', area:'Synthetic Indore Area', working_model:WORK_MODELS[0], reason:REASONS[0], question:'', plan:'FREE', consent:true };
test('fixed IST expiry and post-expiry boundary',()=>{assert.equal(Date.parse(CAMPAIGN.expiresAt),Date.parse('2026-11-08T18:30:00Z'));assert.equal(offerActive(before),true);assert.deepEqual(countdown(before),[0,0,0,1]);assert.equal(offerActive(before+1000),false);assert.deepEqual(countdown(before+900000),[0,0,0,0]);});
test('approved category targets',()=>assert.deepEqual(CATEGORIES.map(c=>[c.name,c.target]),[['Painter',89],['Plumber',89],['Electrician',89],['Technician',87],['Pandit',77]]));
test('both signup plan paths and price snapshot',()=>{for(const plan of ['FREE','PRO']){const v=validateLead({...lead,plan},before);assert.equal(v.selected_plan,plan);assert.equal(v.offered_price,plan==='PRO'?199:plan==='FREE'?0:null);}});
test('post-expiry PRO rejected, FREE remains available',()=>{assert.throws(()=>validateLead({...lead,plan:'PRO'},before+1000));assert.equal(validateLead(lead,before+1000).selected_plan,'FREE');assert.throws(()=>validateLead({...lead,plan:'Not Decided'},before+1000));assert.ok(PLANS.includes('Not Decided'));});
test('Indian phone validation normalizes only supported input',()=>{for(const v of ['9000000000','+91 90000 00000','919000000000'])assert.equal(normalizePhone(v),'9000000000');for(const v of ['1234567890','9999','+1 9000000000','hello9000000000'])assert.equal(normalizePhone(v),null);});
test('required fields, lengths, enums and consent cannot be bypassed',()=>{for(const patch of [{name:''},{phone:'123'},{profession:'Other'},{area:''},{plan:''},{working_model:'Other'},{reason:'Other'},{consent:false},{consent:'true'},{question:'x'.repeat(1001)}])assert.throws(()=>validateLead({...lead,...patch},before));});
test('UTM / referral allowlist and size controls',()=>{const a=attributionFrom(new URLSearchParams('utm_source=facebook&utm_campaign=diwali&ref=IPUC-TEST&admin=true'));assert.deepEqual(a,{utm_source:'facebook',utm_campaign:'diwali',ref:'IPUC-TEST'});assert.equal(attributionFrom(new URLSearchParams({ref:'x'.repeat(300)})).ref.length,150);assert.deepEqual(validateLead({...lead,attribution:a},before).attribution,a);});
test('plan media limits and active profile check',()=>{const w={is_active:true,hero_slides:[{}],photos:[{},{}],videos:[]};assert.equal(profileLimitError(w,'FREE'),null);assert.ok(profileLimitError({...w,videos:[{}]},'FREE'));assert.ok(profileLimitError({...w,is_active:false},'PRO'));assert.equal(profileLimitError({...w,hero_slides:[{},{}],photos:Array(6).fill({}),videos:Array(4).fill({})},'PRO'),null);assert.ok(profileLimitError(w,'Not Decided'));});
test('Hindi validation messages preserve backend enums',()=>{
 for(const patch of [{name:''},{phone:'123'},{profession:''},{area:''},{working_model:''},{reason:''},{consent:false},{question:'x'.repeat(1001)}]){
  assert.throws(()=>validateLead({...lead,...patch},before),e=>/[\u0900-\u097f]/.test(e.message)&&!/[A-Za-z_]/.test(e.message));
 }
 assert.equal(validateLead({...lead,name:'परीक्षण कामगार',area:'विजय नगर'},before).profession,'Painter');
});
const {referencePrice}=await import('../lib/acquisition/hindi.mjs');
test('reference prices need evidence publicly and are labeled in private review',()=>{
 assert.equal(referencePrice('FREE',false,CAMPAIGN),null);
 assert.equal(referencePrice('PRO',false,{referencePrices:{PRO:{amount:499,verified:true}}}),null);
 assert.equal(referencePrice('PRO',true,CAMPAIGN).amount,499);
 assert.match(referencePrice('FREE',true,CAMPAIGN).basis,/पुष्टि बाकी/);
 assert.equal(referencePrice('PRO',false,{referencePrices:{PRO:{amount:499,verified:true,basis:'Documented regular price'}}}).amount,499);
});
test('preferred language is validated metadata and backend enums stay unchanged',()=>{
 for(const language of ['en','hinglish','hi']){
  const row=validateLead({...lead,preferred_language:language,working_model:WORK_MODELS[2],attribution:{utm_source:'instagram',ref:'SYNTHETIC'}},before);
  assert.deepEqual(row.attribution,{utm_source:'instagram',ref:'SYNTHETIC',preferred_language:language});
  assert.equal(row.working_model,WORK_MODELS[2]);
  assert.throws(()=>validateLead({...lead,preferred_language:language,phone:'123'},before),e=>e.code==='phone');
 }
 assert.equal(validateLead({...lead,preferred_language:'unsupported'},before).attribution.preferred_language,undefined);
});

test('optional enquiry messages and exact ten-digit API input in every language', async()=>{
 const {mobileInput,REASONS,WORK_MODELS}=await import('../lib/acquisition/config.mjs');
 const now=Date.parse('2026-10-15T00:00:00+05:30');
 for(const preferred_language of ['en','hinglish','hi'])for(const reason of REASONS.slice(1))for(const question of ['', 'Synthetic question']){
  const body={name:'Synthetic Worker',phone:'9000000000',profession:'Painter',area:'Synthetic Area',plan:'FREE',working_model:WORK_MODELS[0],reason,question,consent:true,preferred_language};
  assert.equal(validateLead(body,now).question,question);
  for(const phone of ['90000000001','900000000','5000000000','+919000000000','abc9000000000'])assert.throws(()=>validateLead({...body,phone},now),e=>e.code==='phone');
 }
 assert.equal(mobileInput('ab90-000 00000'),'9000000000');
 assert.equal(mobileInput('+91 90000 00000'),'9000000000');
 assert.equal(mobileInput('90000000001234').length,10);
});


test('linked workers require the same original phone and profession at EVERY status', async () => {
 const { linkingError, onboardingError } = await import('../lib/acquisition/onboarding.mjs');
 const lead = { phone: '9000000000', profession: 'Painter' };
 const worker = { phone: '+91 90000 00000', profession: 'Painter', slug: 'synthetic-painter', full_name: 'Synthetic Painter', is_active: false, hero_slides: [], photos: [], videos: [] };
 assert.equal(linkingError(worker, lead, 'Painter'), null);
 assert.equal(linkingError({...worker,is_active:true}, lead, 'Painter'), null);
 assert.match(linkingError({...worker, phone:'9000000001'}, lead, 'Painter'), /phone/i);
 assert.match(linkingError({...worker, profession:'Plumber'}, lead, 'Painter'), /category/i);
 assert.match(linkingError(worker, lead, 'Plumber'), /category/i);
 assert.match(linkingError(null, lead, 'Painter'), /profile/i);
 assert.match(onboardingError(worker, lead, 'FREE', 'Painter'), /active/i);
 assert.equal(onboardingError({...worker,is_active:true},lead,'FREE','Painter'), null);
});
