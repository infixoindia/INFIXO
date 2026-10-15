// Runs actual route handlers with a mocked Supabase transport. SQL/RLS tested separately.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require=createRequire(`${process.env.ACQUISITION_TEST_DEPS || '/tmp/infixo-acquisition-tests'}/package.json`);
const {build}=require('esbuild');
const temp='/tmp/infixo-api-tests';await mkdir(temp,{recursive:true});
let worker=null, original={id:'11111111-1111-4111-8111-111111111111',phone:'9000000000',profession:'Painter'}, queries=[];
let response={data:[],error:null,count:0}, inserts=[], allowed=true, insertError=null;
const client={rpc:async name=>name==='acquisition_rate_limit'?{data:allowed,error:null}:{data:[],error:null},from(table){let op='select',one=false;const chain={select(){return chain},order(){return chain},range(){return chain},eq(...args){queries.push(['eq',...args]);return chain},not(...args){queries.push(['not',...args]);return chain},or(...args){queries.push(['or',...args]);return chain},neq(...args){queries.push(['eq',...args]);return chain},not(...args){queries.push(['not',...args]);return chain},or(...args){queries.push(['or',...args]);return chain},ilike(){return chain},gte(){return chain},lte(){return chain},insert(row){op='insert';inserts.push({table,row});return chain},update(){op='update';return chain},single(){one=true;return chain},maybeSingle(){one=true;return chain},then(resolve,reject){return Promise.resolve(op==='insert'?{error:insertError}:one?{data:table==='workers'?worker:original,error:null}:response).then(resolve,reject)}};return chain;}};
globalThis.__acquisitionClient=client;
const plugin={name:'isolated-test-transport',setup(b){b.onResolve({filter:/^next\/server$/},()=>({path:'next-server',namespace:'mock-next'}));b.onLoad({filter:/.*/,namespace:'mock-next'},()=>({contents:`export const NextResponse={json(data,init){const r=Response.json(data,init);r.cookies={set(){}};return r;}};`}));b.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export {}'}));b.onResolve({filter:/^@supabase\/supabase-js$/},()=>({path:'supabase',namespace:'mock-db'}));b.onLoad({filter:/.*/,namespace:'mock-db'},()=>({contents:'export const createClient = (url) => {globalThis.__testDbUrl=url;return globalThis.__acquisitionClient;};'}));}};
for(const [name,entry] of [['join','app/api/join/route.js'],['admin','app/api/admin/leads/route.js'],['server','lib/acquisition/server.js'],['session','lib/adminSession.js'],['login','app/api/admin/login/route.js']])await build({entryPoints:[entry],outfile:`${temp}/${name}.mjs`,bundle:true,platform:'node',format:'esm',plugins:[plugin],logLevel:'silent'});
process.env.NEXT_PUBLIC_SUPABASE_URL='https://synthetic.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-only';process.env.INFIXO_ADMIN_SECRET='synthetic-admin-only';process.env.INFIXO_LEAD_SIGNING_SECRET='synthetic-test-only-'.repeat(3);
const join=await import(`${temp}/join.mjs`),admin=await import(`${temp}/admin.mjs`),server=await import(`${temp}/server.mjs`);
const realNow=Date.now;let now=Date.parse('2026-10-12T00:00:00+05:30');Date.now=()=>now;
const session=await import(`${temp}/session.mjs`); let adminToken=await session.issueSession(process.env.INFIXO_ADMIN_SECRET,10);
const token=server.issueToken();assert.equal(server.validToken(token),false);now+=2000;assert.equal(server.validToken(token),true);assert.equal(server.validToken(token.slice(0,-1)+'z'),false);assert.equal(server.validToken(null),false);
console.log('PASS signed token, minimum form age and tampering rejection');
const body={name:'Synthetic Worker',phone:'9000000000',profession:'Painter',area:'Synthetic Area',plan:'FREE',working_model:'Main Khud Kaam Karta Hoon',reason:'Mujhe INFIXO Profile Banwani Hai',question:'',consent:true,token,attribution:{utm_source:'facebook',ref:'SYNTHETIC'}};
function req(method,payload,origin='https://infixo.test',authed=false){const r=new Request('https://infixo.test/api/join',{method,headers:{'Content-Type':'application/json',origin},...(payload?{body:JSON.stringify(payload)}:{})});r.cookies={get:key=>authed?{value:key==='infixo_admin'?adminToken:'10'}:undefined};return r;}
assert.equal((await join.GET()).status,200);
assert.equal((await join.POST(req('POST',body,'https://evil.invalid'))).status,403);
assert.equal((await join.POST(req('POST',{...body,website:'bot'}))).status,400);
assert.equal((await join.POST(req('POST',{...body,consent:false}))).status,400);
assert.equal((await join.POST(req('POST',{...body,phone:'123'}))).status,400);
assert.equal((await join.POST(req('POST',{...body,question:'x'.repeat(15000)}))).status,400);
console.log('PASS origin, honeypot, consent, phone and request-size checks');
for(const plan of ['FREE','PRO']){const r=await join.POST(req('POST',{...body,plan}));assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true});assert.equal(inserts.at(-1).row.selected_plan,plan);assert.deepEqual(inserts.at(-1).row.attribution,{utm_source:'facebook',ref:'SYNTHETIC'});}
insertError={code:'23505'};assert.deepEqual(await (await join.POST(req('POST',body))).json(),{ok:true});insertError=null;
allowed=false;assert.equal((await join.POST(req('POST',body))).status,429);allowed=true;
insertError={code:'TEST',message:'SECRET SHOULD NEVER LEAK'};const fail=await join.POST(req('POST',body));assert.equal(fail.status,503);assert.ok(!(await fail.text()).includes('SECRET'));insertError=null;
console.log('PASS all plan submissions, attribution, duplicate response, throttling, sanitized failures');
assert.equal((await admin.GET(req('GET'))).status,401);
assert.equal((await admin.PATCH(req('PATCH',{}))).status,401);
assert.equal((await admin.PATCH(req('PATCH',{},'https://evil.invalid',true))).status,403);
response={data:[{name:'Synthetic lead'}],count:1,error:null};const listing=await admin.GET(req('GET',null,'https://infixo.test',true));assert.equal(listing.status,200);assert.equal((await listing.json()).leads.length,1);assert.equal(listing.headers.get('cache-control'),'no-store');
const update={id:'11111111-1111-4111-8111-111111111111',status:'Contacted',selected_plan:'FREE',profession:'Painter',updated_at:new Date(now).toISOString()};
assert.equal((await admin.PATCH(req('PATCH',update,'https://infixo.test',true))).status,200);
assert.equal((await admin.PATCH(req('PATCH',{...update,status:'Approved / Onboarded'},'https://infixo.test',true))).status,400);
response={data:[],error:null};assert.equal((await admin.PATCH(req('PATCH',update,'https://infixo.test',true))).status,409);
console.log('PASS admin authentication, private listing, update, approval guard and stale-write conflict');
now=Date.parse('2026-11-09T00:00:00+05:30');const lateToken=server.issueToken();now+=2000;
assert.equal((await join.POST(req('POST',{...body,token:lateToken,plan:'PRO'}))).status,400);
now+=7200000;assert.equal(server.validToken(lateToken),false);
console.log('PASS server-side expired offer and expired form token');
Date.now=realNow; adminToken=await session.issueSession(process.env.INFIXO_ADMIN_SECRET,10);

assert.equal((await join.POST(req('POST',{...body,plan:'Not Decided'}))).status,400);
assert.equal((await join.POST(req('POST',{...body,plan:''}))).status,400);
console.log('PASS new requests require FREE/PRO');

// Actual route handler: view filters and safe completion, all using mocked fictional profiles.
queries=[];await admin.GET(req('GET',null,'https://infixo.test',true));assert.ok(queries.some(q=>q[0]==='or'&&q[1].includes('linked_worker.is.null')));
const completed=req('GET',null,'https://infixo.test',true);Object.defineProperty(completed,'url',{value:'https://infixo.test/api/admin/leads?view=completed'});
queries=[];await admin.GET(completed);assert.ok(queries.some(q=>q[0]==='not'&&q[1]==='linked_worker'));
const approve={...update,status:'Approved / Onboarded',confirmed:true,worker_id:'22222222-2222-4222-8222-222222222222'};
response={data:[{id:update.id}],error:null};
assert.equal((await admin.PATCH(req('PATCH',approve,'https://infixo.test',true))).status,400);
worker={id:approve.worker_id,phone:original.phone,profession:'Painter',is_active:true,hero_slides:[],photos:[],videos:[]};
assert.equal((await admin.PATCH(req('PATCH',approve,'https://infixo.test',true))).status,400); // Minimal staging row
worker={...worker,slug:'synthetic-profile',full_name:'Synthetic Test'};
assert.equal((await admin.PATCH(req('PATCH',approve,'https://infixo.test',true))).status,200);
// A draft may be linked before approval, but only if phone/category match.
// Protect against direct API requests bypassing the UI's matching selector.
const linkedPending={...update,worker_id:approve.worker_id};
const valid=worker;
worker={...valid,is_active:false};
assert.equal((await admin.PATCH(req('PATCH',linkedPending,'https://infixo.test',true))).status,200);
worker={...valid,phone:'9000000001'};
assert.equal((await admin.PATCH(req('PATCH',linkedPending,'https://infixo.test',true))).status,400);
worker={...valid,profession:'Plumber'};
assert.equal((await admin.PATCH(req('PATCH',linkedPending,'https://infixo.test',true))).status,400);
worker=null;
assert.equal((await admin.PATCH(req('PATCH',linkedPending,'https://infixo.test',true))).status,400);
worker=valid;
console.log('PASS pending lead cannot link mismatched or missing worker; exact draft matching permitted');
for(const change of [{is_active:false},{phone:'9000000001'},{profession:'Plumber'},{videos:[{}]}]){const prior=worker;worker={...worker,...change};assert.equal((await admin.PATCH(req('PATCH',approve,'https://infixo.test',true))).status,400);worker=prior;}
assert.equal((await admin.PATCH(req('PATCH',{...approve,profession:'Plumber'},'https://infixo.test',true))).status,400);
assert.equal((await admin.PATCH(req('PATCH',{...approve,status:'Contacted',worker_id:''},'https://infixo.test',true))).status,200);
console.log('PASS Pending/Completed query filters; missing/minimal/inactive/mismatched/over-limit profiles rejected; completion and correction mocked safely');
for(const reason of ['Mujhe Profile Ke Baare Mein Jaanna Hai','Mera Koi Sawal Hai'])for(const question of ['', 'Synthetic follow-up']){
 now=Date.parse('2026-10-15T00:00:00+05:30');Date.now=()=>now;const tok=server.issueToken();now+=2000;
 const result=await join.POST(req('POST',{...body,reason,question,token:tok}));assert.equal(result.status,200);assert.equal(inserts.at(-1).row.reason,reason);assert.equal(inserts.at(-1).row.question,question);
}Date.now=realNow; adminToken=await session.issueSession(process.env.INFIXO_ADMIN_SECRET,10);
console.log('PASS both enquiry reasons with empty and nonempty optional message saved accurately');

const login=await import(`${temp}/login.mjs`);process.env.INFIXO_ADMIN_PASSWORD='synthetic-password';
assert.equal((await login.POST(req('POST',{},'https://evil.invalid'))).status,403);
allowed=false;assert.equal((await login.POST(req('POST',{password:'synthetic-password'}))).status,429);
allowed=true;assert.equal((await login.POST(req('POST',{password:'wrong'}))).status,401);
assert.equal((await login.POST(req('POST',{password:'synthetic-password',minutes:10}))).status,200);
console.log('PASS login origin protection, throttling, wrong password and signed-cookie success');

// Regression: Production Admin login uses only SIGMA when a legacy Vercel
// URL is absent or malformed. A valid foreign project URL must fail closed.
const oldRuntimeEnv = process.env.VERCEL_ENV;
const oldConfiguredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
process.env.VERCEL_ENV = 'production';
process.env.NEXT_PUBLIC_SUPABASE_URL = '"not-a-url"';
server.db();
assert.equal(globalThis.__testDbUrl, 'https://xyplrbzyqershqngrjwo.supabase.co');
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://vemezdbssynachculphi.supabase.co';
assert.throws(() => server.db(), /project mismatch/);
process.env.NEXT_PUBLIC_SUPABASE_URL = oldConfiguredUrl;
if (oldRuntimeEnv === undefined) delete process.env.VERCEL_ENV;
else process.env.VERCEL_ENV = oldRuntimeEnv;
console.log('PASS L01 production SIGMA URL recovery and cross-project refusal');


// Regression: admin login must continue to work even when acquisition form
// signing is unavailable. Its rate limit is keyed by the separate Admin secret.
const leadSigning = process.env.INFIXO_LEAD_SIGNING_SECRET;
delete process.env.INFIXO_LEAD_SIGNING_SECRET;
const adminRateKey = server.rateKey(req('POST',{password:'synthetic-password'}),'admin-login');
assert.match(adminRateKey,/^[a-f0-9]{64}$/);
assert.equal((await login.POST(req('POST',{password:'synthetic-password',minutes:10}))).status,200);
assert.equal((await login.POST(req('POST',{password:'incorrect'}))).status,401);
assert.throws(()=>server.issueToken(),/signing unavailable/);
process.env.INFIXO_LEAD_SIGNING_SECRET=leadSigning;
console.log('PASS admin login independent of acquisition signing key, rate limiting still active');

// Fail closed with a 503 rather than misreporting a correct password as
// "Invalid request" if the Admin signing key is unavailable.
const adminSecretBackup=process.env.INFIXO_ADMIN_SECRET;
delete process.env.INFIXO_ADMIN_SECRET;
const unavailable=await login.POST(req('POST',{password:'synthetic-password'}));
assert.equal(unavailable.status,503);
assert.match((await unavailable.json()).error,/temporarily unavailable/i);
process.env.INFIXO_ADMIN_SECRET=adminSecretBackup;
console.log('PASS missing Admin signing key surfaces safe service unavailable status');
