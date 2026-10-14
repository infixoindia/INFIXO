// Runs actual route handlers with a mocked Supabase transport. SQL/RLS tested separately.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require=createRequire(`${process.env.ACQUISITION_TEST_DEPS || '/tmp/infixo-acquisition-tests'}/package.json`);
const {build}=require('esbuild');
const temp='/tmp/infixo-api-tests';await mkdir(temp,{recursive:true});
let response={data:[],error:null,count:0}, inserts=[], allowed=true, insertError=null;
const client={rpc:async name=>name==='acquisition_rate_limit'?{data:allowed,error:null}:{data:[],error:null},from(table){let op='select';const chain={select(){return chain},order(){return chain},range(){return chain},eq(){return chain},neq(){return chain},ilike(){return chain},gte(){return chain},lte(){return chain},insert(row){op='insert';inserts.push({table,row});return chain},update(){op='update';return chain},single(){return chain},then(resolve,reject){return Promise.resolve(op==='insert'?{error:insertError}:response).then(resolve,reject)}};return chain;}};
globalThis.__acquisitionClient=client;
const plugin={name:'isolated-test-transport',setup(b){b.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export {}'}));b.onResolve({filter:/^@supabase\/supabase-js$/},()=>({path:'supabase',namespace:'mock-db'}));b.onLoad({filter:/.*/,namespace:'mock-db'},()=>({contents:'export const createClient = () => globalThis.__acquisitionClient;'}));}};
for(const [name,entry] of [['join','app/api/join/route.js'],['admin','app/api/admin/leads/route.js'],['server','lib/acquisition/server.js']])await build({entryPoints:[entry],outfile:`${temp}/${name}.mjs`,bundle:true,platform:'node',format:'esm',plugins:[plugin],logLevel:'silent'});
process.env.NEXT_PUBLIC_SUPABASE_URL='https://synthetic.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-only';process.env.INFIXO_ADMIN_SECRET='synthetic-admin-only';process.env.INFIXO_LEAD_SIGNING_SECRET='synthetic-test-only-'.repeat(3);
const join=await import(`${temp}/join.mjs`),admin=await import(`${temp}/admin.mjs`),server=await import(`${temp}/server.mjs`);
const realNow=Date.now;let now=Date.parse('2026-10-12T00:00:00+05:30');Date.now=()=>now;
const token=server.issueToken();assert.equal(server.validToken(token),false);now+=2000;assert.equal(server.validToken(token),true);assert.equal(server.validToken(token.slice(0,-1)+'z'),false);assert.equal(server.validToken(null),false);
console.log('PASS signed token, minimum form age and tampering rejection');
const body={name:'Synthetic Worker',phone:'9000000000',profession:'Painter',area:'Synthetic Area',plan:'FREE',working_model:'Main Khud Kaam Karta Hoon',reason:'Mujhe INFIXO Profile Banwani Hai',question:'',consent:true,token,attribution:{utm_source:'facebook',ref:'SYNTHETIC'}};
function req(method,payload,origin='https://infixo.test',authed=false){const r=new Request('https://infixo.test/api/join',{method,headers:{'Content-Type':'application/json',origin},...(payload?{body:JSON.stringify(payload)}:{})});r.cookies={get:key=>authed?{value:key==='infixo_admin'?'synthetic-admin-only':'10'}:undefined};return r;}
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
Date.now=realNow;

assert.equal((await join.POST(req('POST',{...body,plan:'Not Decided'}))).status,400);
assert.equal((await join.POST(req('POST',{...body,plan:''}))).status,400);
console.log('PASS new requests require FREE/PRO');
