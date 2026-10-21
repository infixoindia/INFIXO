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
globalThis.window = { addEventListener() {}, removeEventListener() {} };

const plugin = {
  name: 'bilingual-ui-test',
  setup(b) {
    b.onLoad({ filter: /\.module\.css$/ }, async a => ({
      contents: `export default ${JSON.stringify(Object.fromEntries(
        [...new Set((await readFile(a.path, 'utf8')).match(/\.[a-zA-Z][\w-]*/g) || [])]
          .map(c => [c.slice(1), c.slice(1)])))};`,
      loader: 'js',
    }));
    b.onResolve({ filter: /^next\/link$/ }, a => ({ path: a.path, namespace: 'next-test' }));
    b.onLoad({ filter: /.*/, namespace: 'next-test' }, () => ({
      contents: 'export default function Link(props) { return <a {...props} /> }', loader: 'jsx',
    }));
  },
};
const entries = [
  'app/components/WorkDetails/WorkDetails.js',
  'app/components/WorkerDetails/WorkerDetails.js',
  'app/components/admin/WorkDetailsEditor.js',
  'app/components/admin/WorkerDetailsEditor.js',
];
await build({ entryPoints: entries, outdir: deps, entryNames: '[name]-bilingual', bundle: true,
  platform: 'node', format: 'cjs', jsx: 'automatic', loader: { '.js': 'jsx' },
  external: ['react', 'react/jsx-runtime'], alias: { '@': '.' },
  plugins: [plugin], logLevel: 'silent' });
const WorkDetails = require(`${deps}/WorkDetails-bilingual.js`).default;
const WorkerDetails = require(`${deps}/WorkerDetails-bilingual.js`).default;
const WorkDetailsEditor = require(`${deps}/WorkDetailsEditor-bilingual.js`).default;
const WorkerDetailsEditor = require(`${deps}/WorkerDetailsEditor-bilingual.js`).default;
const sample = {
  profession: 'Painter', fullName: 'QA Synthetic', gender: 'Male', age: '30',
  address: 'Indore', languages: ['Hindi'], workingShift: { day: true, night: false },
  whyChooseMe: ['समय पर काम'], whyChooseMeEn: ['On time work'],
  about: ['मेरा नाम है'], aboutEn: ['My name is'],
  verifications: { identityVerified: false, workVerified: false, addressVerified: false },
};
let ui;
const mount = async (C, props) => act(async () => { ui = create(React.createElement(C, props)); });
const switchByLabel = (label) => ui.root.findByProps({ 'aria-label': `${label} language` });
const text = () => JSON.stringify(ui.toJSON());

test('public About Me switches text and legacy English stays disabled', async () => {
  await mount(WorkerDetails, { worker: sample });
  assert.ok(text().includes('मेरा नाम है'));
  assert.ok(!text().includes('My name is'));
  const group = switchByLabel('About Me');
  const buttons = group.findAllByType('button');
  assert.equal(buttons[1].props.disabled, false);
  await act(async () => buttons[1].props.onClick());
  assert.ok(text().includes('My name is'));
  assert.ok(!text().includes('मेरा नाम है'));
  await act(async () => ui.update(React.createElement(WorkerDetails, { worker: { ...sample, aboutEn: [] } })));
  const fallback = switchByLabel('About Me').findAllByType('button');
  assert.equal(fallback[1].props.disabled, true);
  assert.ok(text().includes('मेरा नाम है'));
  await act(async () => ui.unmount());
});

test('public Why Choose Me switches chips without changing unrelated text', async () => {
  await mount(WorkDetails, { worker: sample });
  assert.ok(text().includes('समय पर काम'));
  const buttons = switchByLabel('Why Choose Me').findAllByType('button');
  await act(async () => buttons[1].props.onClick());
  assert.ok(text().includes('On time work'));
  assert.ok(!text().includes('समय पर काम'));
  await act(async () => ui.unmount());
});

test('admin About Me English field unlocks after Hindi save and edits only English', async () => {
  const updates = [];
  const props = { worker: { ...sample, id: '' }, updateField: (key, value) => updates.push([key, value]),
    onSave: () => {}, englishUnlocked: false };
  await mount(WorkerDetailsEditor, props);
  const group = ui.root.findByProps({ 'aria-label': 'About Me editor language' });
  assert.equal(group.findAllByType('button')[1].props.disabled, true);
  await act(async () => ui.update(React.createElement(WorkerDetailsEditor, { ...props, englishUnlocked: true })));
  await act(async () => ui.root.findByProps({ 'aria-label': 'About Me editor language' }).findAllByType('button')[1].props.onClick());
  const area = ui.root.findByType('textarea');
  assert.equal(area.props.lang, 'en');
  await act(async () => area.props.onChange({ target: { value: 'English introduction' } }));
  assert.deepEqual(updates.at(-1), ['aboutEn', ['English introduction']]);
  await act(async () => ui.unmount());
});

test('admin Why Choose Me English chips update only English reasons', async () => {
  const updates = [];
  await mount(WorkDetailsEditor, { worker: sample, updateField: (key, value) => updates.push([key, value]),
    englishUnlocked: true, onSave: () => {} });
  await act(async () => ui.root.findByProps({ 'aria-label': 'Why Choose Me editor language' }).findAllByType('button')[1].props.onClick());
  const input = ui.root.findAllByType('input').find(i => i.props.placeholder === 'e.g. On Time Work');
  await act(async () => input.props.onChange({ target: { value: 'Accurate work' } }));
  const add = input.parent.findAllByType('button').find(b => b.children.join('').includes('Add'));
  await act(async () => add.props.onClick());
  assert.deepEqual(updates.at(-1), ['whyChooseMeEn', ['On time work', 'Accurate work']]);
  await act(async () => ui.unmount());
});
