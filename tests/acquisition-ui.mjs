// Component interaction tests only. Not Android layout/media playback certification.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {copy,LANGUAGES,PROFILE_TRANSLATION_KEYS} from '../lib/acquisition/i18n.mjs';
const deps=process.env.ACQUISITION_TEST_DEPS || '/tmp/infixo-redesign-tests';
const require=createRequire(`${deps}/package.json`),{build}=require('esbuild'),React=require('react'),{create,act}=require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const saved=new Map(),session=new Map();globalThis.localStorage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};globalThis.sessionStorage={getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)};
globalThis.window={location:{href:'https://test.invalid/join?utm_source=instagram&ref=SYNTHETIC',search:'?utm_source=instagram&ref=SYNTHETIC'},matchMedia:()=>({matches:true}),addEventListener(){},removeEventListener(){},history:{replaceState(_,__,u){window.location.href=String(u);window.location.search=new URL(u).search;}}};
globalThis.document={addEventListener(){},removeEventListener(){},documentElement:{lang:''},body:{style:{}},getElementById:()=>({focus(){},scrollIntoView(){}})};
globalThis.__sent=[];globalThis.__focus=[];globalThis.__scroll=[];
const plugin={name:'component-test',setup(b){
 b.onLoad({filter:/\.module\.css$/},async a=>({contents:`export default ${JSON.stringify(Object.fromEntries([...new Set((await readFile(a.path,'utf8')).match(/\.[a-zA-Z][\w-]*/g))].map(s=>[s.slice(1),s.slice(1)])))}`,loader:'js'}));
 b.onResolve({filter:/^next\/(link|dynamic)$/},a=>({path:a.path,namespace:'next-test'}));
 b.onLoad({filter:/.*/,namespace:'next-test'},a=>({loader:'jsx',resolveDir:process.cwd(),contents:a.path==='next/link'?`export default function Link(p){return <a {...p}/>}`:`import {lazy,Suspense} from 'react';export default function dynamic(load){const C=lazy(load);return p=><Suspense fallback={null}><C {...p}/></Suspense>}`}));
 b.onLoad({filter:/\/acquisition\/client\.mjs$/},()=>({contents:"export async function getJoinSession(){return {token:'synthetic',serverNow:Date.now()}};export async function sendLead(p){globalThis.__sent.push(p);return {preview:globalThis.__liveReceipt!==true}}",loader:'js'}));
}};
for(const [name,entry] of [['leads','app/admin/leads/page.js'],['join','app/join/JoinPage.js'],['demo','app/demo/worker/DemoProfile.js'],['privacy','app/join/privacy/page.js'],['terms','app/join/terms/page.js']])await build({entryPoints:[entry],outfile:`${deps}/${name}-ui.cjs`,bundle:true,platform:'node',format:'cjs',jsx:'automatic',loader:{'.js':'jsx'},external:['react','react/jsx-runtime'],plugins:[plugin],logLevel:'silent'});
const Join=require(`${deps}/join-ui.cjs`).default,Demo=require(`${deps}/demo-ui.cjs`).default;
const flatten=n=>typeof n==='string'?n:Array.isArray(n)?n.map(flatten).join(' '):n?.children?flatten(n.children):'';
let ui;const mount=async(C,p={})=>act(async()=>{ui=create(React.createElement(C,p),{createNodeMock:e=>e.props.id==='join-success'?{focus:()=>__focus.push('success'),scrollIntoView:()=>__scroll.push('success')}:e.props.id==='apply'?{querySelector:selector=>({focus:()=>__focus.push(selector),scrollIntoView:()=>__scroll.push(selector)})}:e.type==='video'?{play:()=>Promise.resolve(),pause(){},duration:6,currentTime:0}:null});});
const unmount=async()=>act(async()=>ui.unmount());
await mount(Join,{serverNow:Date.now(),preview:true});
assert.equal(ui.root.findAllByType('form').length,1);assert.equal(ui.root.findAllByProps({name:'plan'}).length,2);assert.ok(ui.root.findAllByProps({name:'plan'}).every(n=>!n.props.checked));
assert.ok(ui.root.findAllByType('a').filter(a=>flatten(a).includes(copy('hinglish').join)).every(a=>a.props.href==='#apply'));
assert.equal(ui.root.findAllByType('del').length,2);
assert.equal(ui.root.findByProps({type:'submit'}).props.disabled,true);
await act(async()=>ui.root.findByType('form').props.onSubmit({preventDefault(){}}));
assert.equal(ui.root.findAllByProps({role:'alert'}).length,0);assert.equal(__sent.length,0);
for(const key of ['previewLabel','shareLink','shareQr','plansEyebrow','swipe','planNote'])assert.ok(!flatten(ui.toJSON()).includes(copy('hinglish')[key]),key);
assert.ok(ui.root.findAllByType('a').some(a=>a.props.href==='/demo/worker?lang=hinglish'));

const set=async(name,value,type='text')=>act(async()=>ui.root.findByProps({name}).props.onChange({target:{name,value,type,checked:value}}));
const values={name:'Synthetic Worker',phone:'9000000000',profession:'Painter',area:'Synthetic Indore',working_model:'Main Helpers Ke Saath Kaam Karta Hoon',reason:'Mera Koi Sawal Hai',question:'Synthetic question'};
for(const [k,v] of Object.entries(values))await set(k,v);await set('consent',true,'checkbox');
assert.equal(ui.root.findByProps({type:'submit'}).props.disabled,false);
await set('consent',false,'checkbox');assert.equal(ui.root.findByProps({type:'submit'}).props.disabled,true);
await set('consent',true,'checkbox');
await act(async()=>ui.root.findByProps({name:'plan',value:'PRO'}).props.onChange());
await unmount();await mount(Demo);await unmount();await mount(Join,{serverNow:Date.now(),preview:true});
for(const [k,v] of Object.entries(values))assert.equal(ui.root.findByProps({name:k}).props.value,v);
assert.equal(ui.root.findByProps({name:'plan',value:'PRO'}).props.checked,true);
console.log('PASS V4 removed elements, consent disable/enable/revoke, no premature error, demo round-trip draft restore');
for(const lang of LANGUAGES){await act(async()=>ui.root.findByProps({'aria-haspopup':'menu'}).props.onClick());assert.equal(ui.root.findAllByProps({role:'menuitemradio'}).length,3);await act(async()=>ui.root.findAllByProps({role:'menuitemradio'})[LANGUAGES.indexOf(lang)].props.onClick());assert.equal(ui.root.findAllByProps({role:'menu'}).length,0);
 assert.equal(ui.root.findByType('h1').children.join(''),copy(lang).headline);
 assert.equal(ui.root.findByProps({id:'plans-title'}).children.join(''),['Select Your Profile Plan','Apna Profile Plan Chunein','अपना प्रोफाइल प्लान चुनें'][LANGUAGES.indexOf(lang)]);assert.deepEqual(ui.root.findByProps({className:'steps'}).findAllByType('strong').map(n=>flatten(n)),copy(lang).steps);assert.ok(!flatten(ui.toJSON()).includes(copy(lang).formIntro));assert.equal(ui.root.findByProps({className:'steps'}).findAllByType('small').length,0);assert.equal(saved.get('infixo-language'),lang);assert.equal(new URL(window.location.href).searchParams.get('lang'),lang);
 for(const [k,v] of Object.entries(values))assert.equal(ui.root.findByProps({name:k}).props.value,v);
 assert.equal(ui.root.findByProps({name:'consent'}).props.checked,true);
 await set('phone','123');await act(async()=>ui.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(flatten(ui.root.findByProps({role:'alert'})),copy(lang).errors.phone);await set('phone',values.phone);
}
console.log('PASS all 3 languages, instant copy/errors, persistence, preserved fields/consent, direct CTAs and no plan gate');
for(const plan of ['FREE','PRO'])await act(async()=>ui.root.findByProps({name:'plan',value:plan}).props.onChange());
await act(async()=>ui.root.findByType('form').props.onSubmit({preventDefault(){}}));
assert.equal(__sent.length,1);assert.equal(__sent[0].plan,'PRO');assert.equal(__sent[0].preferred_language,'hi');assert.equal(__sent[0].working_model,values.working_model);assert.deepEqual(__sent[0].attribution,{utm_source:'instagram',ref:'SYNTHETIC'});assert.ok(flatten(ui.toJSON()).includes(copy('hi').testBody));
await unmount();await mount(Join,{serverNow:Date.now()});assert.equal(ui.root.findByType('h1').children.join(''),copy('hi').headline);assert.equal(ui.root.findAllByType('del').length,0);await unmount();
console.log('PASS in-form plans, PRO question enquiry, working model, referral, language payload and truthful preview result');
window.location.search='?lang=hi';
await mount(Demo);
assert.equal(ui.root.findAllByType('a').filter(a=>a.props.href?.startsWith('/demo/worker/work')).length,4);
assert.ok(!ui.root.findAllByType('a').some(a=>/^tel:|wa.me/.test(a.props.href||'')));
const slider=ui.root.findAll(n=>n.type==='div'&&n.props.className==='sliderContainer')[0];
const nextSlide=ui.root.findAllByType('button').find(b=>b.props['aria-label']==='Go to slide 2');assert.ok(nextSlide);await act(async()=>nextSlide.props.onClick({stopPropagation(){}}));
assert.ok(ui.root.findAll(n=>n.type==='div'&&n.props.style?.transform?.includes('-200%')).length>0);
const track=ui.root.findAll(n=>n.type==='div'&&n.props.className==='sliderTrack'&&n.props.onTransitionEnd)[0];
await act(async()=>track.props.onTransitionEnd());
await act(async()=>{slider.props.onTouchStart({targetTouches:[{clientX:300}]});slider.props.onTouchMove({targetTouches:[{clientX:100}]});slider.props.onTouchEnd();});
assert.ok(ui.root.findAll(n=>n.type==='div'&&n.props.style?.transform?.includes('-300%')).length>0);
await act(async()=>slider.props.onClick());assert.ok(ui.root.findAllByProps({'aria-label':'Close'}).length);
await act(async()=>ui.root.findAllByProps({'aria-label':'Close'})[0].props.onClick());
for(const label of ['Call','WhatsApp']){const contact=ui.root.findAllByType('button').find(b=>flatten(b).trim()===label);assert.ok(contact);await act(async()=>contact.props.onClick());assert.equal(ui.root.find(n=>typeof n.type==='function'&&n.type.name==='DemoContact').props.open,true);assert.ok(flatten(ui.root.findByType('dialog')).includes(copy('en').demoModalBody));await act(async()=>ui.root.findByType('dialog').props.onCancel({preventDefault(){}}));assert.equal(ui.root.find(n=>typeof n.type==='function'&&n.type.name==='DemoContact').props.open,false);}
assert.equal(ui.root.findAllByType('footer').length,0);await unmount();
console.log('PASS demo navigation, identity slide selection/swipe/full-view and safe contact feedback');
for(const section of ['work-details','worker-details','work-photos','work-videos']){
 await mount(Demo,{section});assert.ok(ui.root.findAllByType('a').some(a=>a.props.href==='/demo/worker?lang=hi'));
 if(section==='work-photos'){const photo=ui.root.findAll(n=>n.type==='div'&&n.props.className==='photoItem')[0];await act(async()=>photo.props.onClick());assert.ok(ui.root.findAllByProps({'aria-label':'Close'}).length);}
 if(section==='work-videos'){const item=ui.root.findAll(n=>n.type==='div'&&n.props.onClick&&n.props.className?.includes('videoCard'))[0];assert.ok(item);await act(async()=>item.props.onClick());assert.ok(ui.root.findAllByType('video').some(v=>v.props.src==='/demo-media/work-1.mp4'));}
 await unmount();
}
console.log('PASS demo work/worker details, photo viewer open, video viewer/source and back links (playback not browser-tested)');
const keys=JSON.parse(await readFile('app/demo/worker/generated/translation-keys.json','utf8'));for(const k of keys)assert.ok(PROFILE_TRANSLATION_KEYS.includes(k),`Missing translation: ${k}`);
// The real WorkPhotos wrapper intentionally supports non-destructive {image,crop}
// entries. The generated demo remains frozen; preserve strict hashes for
// all other generated components and check WorkPhotos compatibility.
const hashes=JSON.parse(await readFile('app/demo/worker/generated/source-hashes.json','utf8'));
for(const [path,hash] of Object.entries(hashes)) {
  const current=await readFile(path);
  if(path==='app/components/WorkerIdentityCard/WorkerIdentityCard.js') {
    // Public worker cards intentionally gained an expandable years label.
    // The generated landing demo stays frozen; unrelated source hashes remain strict.
    const source = current.toString('utf8');
    assert.match(source,/shortExperience/);
    assert.match(source,/experienceOpen/);
    assert.match(source,/aria-controls="experience-details"/);
    continue;
  }
  if(path==='app/components/WorkPhotos/WorkPhotos.js') {
    const source=current.toString('utf8');
    assert.match(source,/workPhotoDisplay/);
    assert.match(source,/CroppedImage/);
    assert.match(source,/viewerImage/);
    continue;
  }
  // Production profile now intentionally has independent bilingual card
  // controls; the generated demo remains frozen, and all unrelated source
  // components continue to use strict hashes.
  if(path==='app/components/WorkDetails/WorkDetails.js') {
    const source=current.toString('utf8');
    assert.match(source,/SectionLanguageToggle/);
    assert.match(source,/whyLanguage/);
    assert.match(source,/englishAvailable=/);
    continue;
  }
  if(path==='app/components/WorkerDetails/WorkerDetails.js') {
    const source=current.toString('utf8');
    assert.match(source,/SectionLanguageToggle/);
    assert.match(source,/aboutLanguage/);
    assert.match(source,/englishAvailable=/);
    continue;
  }
  assert.equal(createHash('sha256').update(current).digest('hex'),hash);
}
const css=await readFile('app/join/join.module.css','utf8');assert.match(css,/scroll-snap-type:x mandatory/);assert.match(css,/flex:0 0 87%/);
console.log('PASS demo translation coverage, original component hashes, mobile carousel CSS contract');

for(const lang of LANGUAGES){window.location.search='?lang='+lang;for(const section of ['','work-details','worker-details','work-photos','work-videos']){await mount(Demo,{section});const text=flatten(ui.toJSON());if(section==='work-photos'||section==='work-videos'){assert.equal(ui.root.findAllByType('h2')[0].children.join(''),section==='work-photos'?'Work Photos':'Work Videos');assert.ok(text.includes(section==='work-photos'?'Sample photos':'Sample videos'));assert.equal(ui.root.findAllByType('footer').length,0);}assert.ok(!/Interior painting|Wall putty|Texture painting|Vijay Nagar|काल्पनिक पेंटर|8\+/.test(text));if(!section)assert.ok(text.includes(copy(lang).demoProfession));if(section==='work-details')assert.ok(text.includes(copy(lang).demoExperience));if(section==='worker-details'){assert.ok(text.includes(copy(lang).demoFullName));assert.equal(ui.root.findAll(n=>n.props.className==='verificationHeader').length,0);}await unmount();}}
console.log('PASS V4 universal demo placeholders in 3 languages and no empty verification box');

assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);assert.match(css,/appearance:none/);assert.match(css,/width:145px/);console.log('PASS V5 fixed gallery headings, no bottom links, horizontal step CSS and stable SVG selector');

for(const name of ['privacy','terms']){const Page=require(`${deps}/${name}-ui.cjs`).default;for(const lang of LANGUAGES){window.location.search='?lang='+lang;await mount(Page);assert.ok(ui.root.findByProps({className:'policyHeader'}));assert.equal(ui.root.findAllByType('a')[0].props.href,`/join?lang=${lang}#apply`);if(name==='terms')assert.equal(ui.root.findAllByType('section').length,14);await unmount();}}
const demoSource=await readFile('app/demo/worker/DemoProfile.js','utf8');assert.match(demoSource,/<Header\/>/);assert.ok(!/WorkerShareFab|AdminEditFab/.test(demoSource));
console.log('PASS V6 custom language menu, all policy languages/routes and original profile header reuse; no floating X');

// Fixed UI remains English while values follow the selected language.
for(const lang of LANGUAGES){window.location.search='?lang='+lang;for(const section of ['','work-details','worker-details','work-photos','work-videos']){
 await mount(Demo,{section});const text=flatten(ui.toJSON());
 if(!section){assert.ok(text.includes(copy(lang).demoName));const card=ui.root.find(n=>typeof n.type==='function'&&n.type.name==='WorkerIdentityCard');assert.equal(card.props.worker.experience,'Your');assert.deepEqual(card.props.worker.serviceArea,['Your']);assert.ok(ui.root.findAllByType('image').some(n=>n.props.href==='/images/infixo-complete-logo.png'));}
 if(section==='work-details'){for(const label of ['Work Details','Primary Skill','Services','Experience','Working Hours','Working Shift','Service Area','Why Choose Me','Everything about the work.','Reasons to choose this worker'])assert.ok(text.includes(label),label);for(const k of ['demoProfession','demoExperience','demoHours','demoShift','demoServiceArea'])assert.ok(text.includes(copy(lang)[k]),k);for(const k of ['demoServices','demoReasons'])for(const value of copy(lang)[k])assert.ok(text.includes(value),value);}
 if(section==='worker-details'){for(const label of ['Worker Details','Age','Gender','Address','Languages','About Me'])assert.ok(text.includes(label),label);for(const k of ['demoFullName','demoGender','demoAge','demoArea'])assert.ok(text.includes(copy(lang)[k]),k);for(const value of copy(lang).demoAbout)assert.ok(text.includes(value));}
 await unmount();
}}
await mount(Join,{serverNow:Date.now(),preview:true});assert.equal(ui.root.findAllByType('image').filter(n=>n.props.href==='/images/infixo-complete-logo.png').length,2);await unmount();
console.log('PASS fixed English UI, translated sample information in 3 languages, Your identity values, complete logo in all 3 locations');

// New registration flow: isolated component tests, no hosted submissions.
globalThis.__liveReceipt=true;
for(const lang of LANGUAGES){
 session.clear();saved.delete('infixo-join-receipt');saved.set('infixo-language',lang);window.location.search='?lang='+lang;
 await mount(Join,{serverNow:Date.now()});
 const all={...values,question:'',phone:'9000000000'};
 for(const [k,v] of Object.entries(all))await set(k,v);
 await set('consent',true,'checkbox');
 await act(async()=>ui.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(flatten(ui.root.findByProps({role:'alert'})),copy(lang).errors.plan);
 await act(async()=>ui.root.findByProps({name:'plan',value:'FREE'}).props.onChange());
 for(const field of ['name','phone','profession','area','working_model','reason']){
  await set(field,'');await act(async()=>ui.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(flatten(ui.root.findByProps({role:'alert'})),copy(lang).errors[field]);
  await new Promise(r=>setTimeout(r,5));assert.equal(__focus.at(-1),`[name="${field}"]`);
  await set(field,all[field]);
 }
 await set('phone','abc9000000000123');assert.equal(ui.root.findByProps({name:'phone'}).props.value,'9000000000');
 await act(async()=>ui.root.findByProps({name:'phone'}).props.onPaste({preventDefault(){},clipboardData:{getData:()=>'+91 90000 00000'}}));assert.equal(ui.root.findByProps({name:'phone'}).props.value,'9000000000');
 const before=__sent.length;
 await act(async()=>{const submit=ui.root.findByType('form').props.onSubmit;await Promise.all([submit({preventDefault(){}}),submit({preventDefault(){}})]);});
 assert.equal(__sent.length,before+1);assert.equal(__sent.at(-1).question,'');
 await new Promise(r=>setTimeout(r,5));assert.equal(__scroll.at(-1),'success');assert.equal(__focus.at(-1),'success');
 await act(async()=>ui.root.findAllByType('button').find(b=>flatten(b)===copy(lang).back).props.onClick());
 assert.ok(flatten(ui.toJSON()).includes(copy(lang).alreadyBody));assert.equal(ui.root.findAllByType('form').length,0);
 await unmount();await mount(Join,{serverNow:Date.now()});assert.equal(ui.root.findAllByType('form').length,0);assert.ok(flatten(ui.toJSON()).includes(copy(lang).alreadyBody));
 await act(async()=>ui.root.findAllByType('button').find(b=>flatten(b)===copy(lang).followup).props.onClick());assert.equal(ui.root.findAllByType('form').length,1);assert.equal(ui.root.findByProps({name:'consent'}).props.checked,false);
 await unmount();
}
console.log('PASS 3-language required-field errors/focus, digit paste/length, single-submit lock, success scroll, receipt reload, Wapas confirmation and explicit follow-up');

const Leads=require(`${deps}/leads-ui.cjs`).default;
let requests=[];
globalThis.fetch=async url=>{requests.push(String(url));return {ok:true,status:200,json:async()=>({leads:[],count:0,progress:[]})};};
await mount(Leads);
assert.ok(requests.at(-1).includes('view=pending'));
await act(async()=>ui.root.findAllByType('button').find(b=>flatten(b)==='Completed Onboarding').props.onClick());
assert.ok(requests.at(-1).includes('view=completed'));
await act(async()=>ui.root.findAllByType('button').find(b=>flatten(b)==='Pending Leads').props.onClick());
assert.ok(requests.at(-1).includes('view=pending'));await unmount();
console.log('PASS Admin view buttons request Pending by default and switch Completed/Pending');
