import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const deps = process.env.ACQUISITION_TEST_DEPS || '/tmp/infixo-redesign-tests';
const require = createRequire(`${deps}/package.json`);
const { build } = require('esbuild');
const React = require('react');
const { create, act } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__qaWorkers = [];
const documentHandlers = new Map();
globalThis.document = {
  addEventListener: (name, handler) => documentHandlers.set(name, handler),
  removeEventListener: (name, handler) => { if (documentHandlers.get(name) === handler) documentHandlers.delete(name); },
};

const plugin = { name: 'worker-status-identity-tests', setup(b) {
  b.onLoad({ filter: /\.module\.css$/ }, () => ({
    contents: 'export default new Proxy({}, {get:(_,key)=>String(key)})', loader: 'js'
  }));
  b.onResolve({ filter: /^next\/link$/ }, a => ({path:a.path,namespace:'link-test'}));
  b.onLoad({filter:/.*/,namespace:'link-test'}, () => ({
    contents:'export default function Link(props){return <a {...props}/>}',loader:'jsx'
  }));
  b.onResolve({filter:/^@\/lib\/workerService$/},a=>({path:a.path,namespace:'worker-service-test'}));
  b.onLoad({filter:/.*/,namespace:'worker-service-test'},()=>({
    contents:'export async function listWorkers(){return globalThis.__qaWorkers}',loader:'js'
  }));
  b.onResolve({filter:/\/HeroSlider$/},a=>({path:a.path,namespace:'hero-test'}));
  b.onLoad({filter:/.*/,namespace:'hero-test'},()=>({
    contents:'export default function HeroSlider(){return <div data-testid="hero"/>}',loader:'jsx'
  }));
}};

await build({
  entryPoints:['app/admin/workers/page.js','app/components/WorkerIdentityCard/WorkerIdentityCard.js'],
  outdir:deps,entryNames:'[name]-status-test',bundle:true,platform:'node',format:'cjs',
  loader:{'.js':'jsx'},jsx:'automatic',
  external:['react','react/jsx-runtime'],plugins:[plugin],logLevel:'silent'
});
const WorkersList=require(`${deps}/page-status-test.js`).default;
const WorkerIdentityCard=require(`${deps}/WorkerIdentityCard-status-test.js`).default;
let ui;
const mount=async(C,props={})=>act(async()=>{ui=create(React.createElement(C,props));});
const unmount=async()=>act(async()=>ui.unmount());
const getText=()=>JSON.stringify(ui.toJSON());

test('worker list defaults to active and toggles to inactive without showing both lists',async()=>{
  globalThis.__qaWorkers=[
    {id:'a',fullName:'Active Alpha',profession:'Painter',isActive:true},
    {id:'b',fullName:'Inactive Beta',profession:'Plumber',isActive:false}
  ];
  await mount(WorkersList);
  let tree=getText();
  assert.ok(tree.includes('Active Alpha'));
  assert.ok(!tree.includes('Inactive Beta'));
  assert.ok(!tree.includes('This list contains created Worker Profiles'));
  assert.ok(!tree.includes('New profiles stay private'));
  let tabs=ui.root.findAllByProps({role:'tab'});
  assert.equal(tabs.length,2);
  assert.equal(tabs[0].props['aria-selected'],true);
  assert.equal(tabs[1].props['aria-selected'],false);
  await act(async()=>tabs[1].props.onClick());
  tree=getText();
  assert.ok(!tree.includes('Active Alpha'));
  assert.ok(tree.includes('Inactive Beta'));
  assert.equal(ui.root.findAllByProps({role:'tabpanel'}).length,1);
  tabs=ui.root.findAllByProps({role:'tab'});
  assert.equal(tabs[1].props['aria-selected'],true);
  await act(async()=>tabs[0].props.onClick());
  assert.ok(getText().includes('Active Alpha'));
  assert.ok(!getText().includes('Inactive Beta'));
  await unmount();
});

test('empty inactive tab displays only its own empty state',async()=>{
  globalThis.__qaWorkers=[{id:'a',fullName:'Active Alpha',profession:'Painter',isActive:true}];
  await mount(WorkersList);
  await act(async()=>ui.root.findAllByProps({role:'tab'})[1].props.onClick());
  assert.ok(getText().includes('No inactive profiles yet.'));
  assert.ok(!getText().includes('Active Alpha'));
  await unmount();
});

test('experience displays only static 35+ Y over Experience label',async()=>{
  const worker={fullName:'Mohan Test',profession:'Painter',experience:35,serviceArea:['Indore'],heroSlides:[],isVerified:false};
  await mount(WorkerIdentityCard,{worker});
  const compact=ui.root.findByProps({className:'experienceShort'});
  assert.equal(compact.type,'span');
  assert.equal(compact.children.join(''),'35+ Y');
  assert.ok(getText().includes('Experience'));
  assert.equal(ui.root.findAllByProps({'aria-label':'Show full experience'}).length,0);
  assert.equal(ui.root.findAllByProps({id:'experience-details'}).length,0);
  assert.equal(ui.root.findAllByProps({className:'experiencePopover'}).length,0);
  await unmount();
});

test('static compact years handle old text and missing values without interaction',async()=>{
  const worker={fullName:'Mohan Test',profession:'Painter',experience:'35+ Years',serviceArea:['Indore'],heroSlides:[],isVerified:false};
  await mount(WorkerIdentityCard,{worker});
  assert.equal(ui.root.findByProps({className:'experienceShort'}).children.join(''),'35+ Y');
  assert.ok(!getText().includes('35++ Y'));
  assert.ok(!getText().includes('35+ Years of Experience'));
  await unmount();
  await mount(WorkerIdentityCard,{worker:{...worker,experience:''}});
  assert.equal(ui.root.findByProps({className:'experienceShort'}).children.join(''),'—');
  await unmount();
  const css=await readFile('app/components/WorkerIdentityCard/WorkerIdentityCard.module.css','utf8');
  assert.ok(!/experiencePopup|experiencePopover|experienceButton|experiencePointer|experienceAnchor/.test(css));
  const component=await readFile('app/components/WorkerIdentityCard/WorkerIdentityCard.js','utf8');
  assert.ok(!/experienceOpen|experience-details|setExperienceOpen|experienceButtonRef|pointerdown/.test(component));
});
