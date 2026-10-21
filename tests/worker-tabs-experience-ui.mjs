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

test('plain-text popup appears ABOVE experience box without an inline arrow or pill',async()=>{
  const worker={fullName:'Mohan Test',profession:'Painter',experience:35,serviceArea:['Indore'],heroSlides:[],isVerified:false};
  await mount(WorkerIdentityCard,{worker});
  const collapsedButton=ui.root.findByProps({'aria-label':'Show full experience'});
  assert.equal(collapsedButton.props['aria-expanded'],false);
  assert.ok(getText().includes('35+ Y'));
  assert.ok(!getText().includes('35+ Years of Experience'));
  // The short value has no arrow next to it, only the text span.
  assert.equal(collapsedButton.findAllByType('span').length,1);
  assert.equal(collapsedButton.findAllByType('span')[0].children.join(''),'35+ Y');
  await act(async()=>collapsedButton.props.onClick());
  assert.equal(ui.root.findByProps({'aria-label':'Show full experience'}).props['aria-expanded'],true);
  const popover=ui.root.findByProps({id:'experience-details'});
  assert.equal(popover.props.role,'status');
  assert.ok(JSON.stringify(popover.toJSON()).includes('35+ Years of Experience'));
  assert.ok(JSON.stringify(popover.toJSON()).includes('experiencePointer'));
  const infoBox=ui.root.findByProps({className:'infoBox'});
  assert.ok(!JSON.stringify(infoBox.toJSON()).includes('35+ Years of Experience'));
  assert.equal(ui.root.findByProps({'aria-label':'Show full experience'}).findAllByType('span').length,1);
  const css=await readFile('app/components/WorkerIdentityCard/WorkerIdentityCard.module.css','utf8');
  const popupRules=css.match(/\.experiencePopover \{[^}]+\}/)?.[0]||'';
  assert.ok(popupRules.includes('position: absolute'));
  assert.ok(!/background:|border:|border-radius:|box-shadow:/.test(popupRules),'popover must be plain text, not a pill');
  await act(async()=>ui.root.findByProps({'aria-label':'Show full experience'}).props.onClick());
  assert.ok(!getText().includes('35+ Years of Experience'));
  await unmount();
});

test('experience popup closes on any outside tap and after two seconds',async()=>{
  const worker={fullName:'Mohan Test',profession:'Painter',experience:'35+ Years',serviceArea:['Indore'],heroSlides:[],isVerified:false};
  await mount(WorkerIdentityCard,{worker});
  assert.ok(getText().includes('35+ Y'));
  assert.ok(!getText().includes('35++ Y'));
  await act(async()=>ui.root.findByProps({'aria-label':'Show full experience'}).props.onClick());
  assert.equal(typeof documentHandlers.get('pointerdown'),'function');
  await act(async()=>documentHandlers.get('pointerdown')({target:{}}));
  assert.equal(ui.root.findByProps({'aria-label':'Show full experience'}).props['aria-expanded'],false);
  assert.equal(documentHandlers.has('pointerdown'),false);
  await act(async()=>ui.root.findByProps({'aria-label':'Show full experience'}).props.onClick());
  assert.equal(ui.root.findByProps({'aria-label':'Show full experience'}).props['aria-expanded'],true);
  // Real timer verifies the actual 2000ms behavior without replacing React's scheduler.
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,2150));});
  assert.equal(ui.root.findByProps({'aria-label':'Show full experience'}).props['aria-expanded'],false);
  assert.ok(!getText().includes('35+ Years of Experience'));
  assert.equal(documentHandlers.has('pointerdown'),false);
  await unmount();
});
