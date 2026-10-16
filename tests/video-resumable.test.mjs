import test from 'node:test';
import assert from 'node:assert/strict';
import { uploadResumableVideo } from '../lib/videoResumableUpload.js';

function setup({ failFirstPatch = false } = {}) {
  const originalXHR = globalThis.XMLHttpRequest;
  const originalFetch = globalThis.fetch;
  const trace = [];
  let offset = 0, failed = false;
  globalThis.fetch = async (url, opts) => {
    assert.equal(url, '/api/admin/video-upload');
    assert.equal(opts.method, 'POST');
    assert.equal(new TextDecoder().decode(new TextEncoder().encode(opts.body)).includes('workerId'), true);
    return { ok:true, json:async()=>({
      token:'presigned-temporary',path:'worker-1/videos/uuid.mp4',
      bucket:'worker-media',publicUrl:'https://staging.example/storage/v1/object/public/worker-media/worker-1/videos/uuid.mp4',
      endpoint:'https://staging.storage.supabase.co/storage/v1/upload/resumable/sign',
      publicApiKey:'sb_publishable_staging_test_public_only',
    })};
  };
  class FakeXHR {
    constructor() { this.upload = {}; this.headers = {}; this.status = 0; }
    open(method, endpoint) { this.method=method; this.endpoint=endpoint; }
    setRequestHeader(key, value) { this.headers[key]=value; }
    getResponseHeader(key) { return this.resultHeaders?.[key.toLowerCase()] || null; }
    send(data) {
      queueMicrotask(() => {
        try {
          trace.push({method:this.method, endpoint:this.endpoint, headers:this.headers, size:data?.size||0});
          assert.equal(this.headers['x-signature'], 'presigned-temporary');
          assert.equal(this.headers['Tus-Resumable'], '1.0.0');
          assert.equal(this.headers.apikey, 'sb_publishable_staging_test_public_only');
          assert.equal(this.headers.authorization, undefined);
          if (this.method === 'POST') {
            assert.match(this.endpoint, /\/storage\/v1\/upload\/resumable\/sign$/);
          }
          this.status = this.method === 'POST' ? 201 : 204;
          if (this.method==='POST') this.resultHeaders={location:'/storage/v1/upload/resumable/SESSION'};
          if (this.method==='HEAD') this.resultHeaders={'upload-offset':String(offset)};
          if (this.method==='PATCH') {
            if (failFirstPatch && !failed) { failed=true; this.onerror(); return; }
            assert.equal(this.headers['Content-Type'], 'application/offset+octet-stream');
            assert.equal(Number(this.headers['Upload-Offset']), offset);
            assert.ok(data.size <= 6*1024*1024);
            if (this.upload.onprogress) this.upload.onprogress({lengthComputable:true,loaded:data.size,total:data.size});
            offset += data.size;
            this.resultHeaders={'upload-offset':String(offset)};
          }
          this.onload();
        } catch(e) { this.onerror?.(); throw e; }
      });
    }
  }
  globalThis.XMLHttpRequest = FakeXHR;
  return { trace, restore() { globalThis.XMLHttpRequest=originalXHR;globalThis.fetch=originalFetch; } };
}
function videoFile() {
  const header=new Uint8Array(16);
  header.set([0,0,0,24,102,116,121,112,105,115,111,109]);
  return new File([header,new Uint8Array(15*1024*1024-16)],'sample.mp4',{type:'video/mp4'});
}
test('15MB goes direct to Storage in 6MB TUS chunks without Vercel body proxy',async()=>{
  const s=setup();
  try {
    const percents=[];
    const url=await uploadResumableVideo(videoFile(),'worker-1',p=>percents.push(p));
    assert.match(url,/worker-1\/videos\/uuid.mp4/);
    assert.equal(s.trace.filter(x=>x.method==='PATCH').length,3);
    assert.equal(s.trace.filter(x=>x.method==='POST').length,1);
    assert.equal(s.trace.filter(x=>x.method==='HEAD').length,3);
    assert.equal(percents.at(-1),100);
  }finally{s.restore();}
});
test('interruption retries only the incomplete chunk and resumes offset',async()=>{
  const s=setup({failFirstPatch:true});
  try{
    const url=await uploadResumableVideo(videoFile(),'worker-1',()=>{});
    assert.ok(url);
    assert.equal(s.trace.filter(x=>x.method==='POST').length,1);
    assert.equal(s.trace.filter(x=>x.method==='PATCH').length,4);
    assert.equal(s.trace.filter(x=>x.method==='HEAD').length,4);
  }finally{s.restore();}
});
