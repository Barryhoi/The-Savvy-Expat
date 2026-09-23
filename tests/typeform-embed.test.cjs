const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = require('node:path').resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
const source = fs.readFileSync(root + '/components/TypeformEmbed.tsx', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
}}).outputText;

function mount(phone, initialStatus = "loading") {
  let effect, id = 0;
  const attrs = {}, frames = new Map(), timers = new Map(), listeners = new Map();
  const scrolls = [], pushes = [], states = [];
  const contentWindow = {};
  const host = {
    setAttribute: (key, value) => attrs[key] = value,
    querySelector: () => ({ contentWindow }),
    scrollIntoView: value => scrolls.push(value),
  };
  const win = {
    innerHeight: 664, tf: { load() {} },
    matchMedia: () => ({ matches: phone }),
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    setTimeout: fn => { timers.set(++id, fn); return id; },
    clearTimeout: key => timers.delete(key),
    addEventListener: (key, fn) => listeners.set(key, fn),
    removeEventListener: (key, fn) => { if (listeners.get(key) === fn) listeners.delete(key); },
  };
  const exports = {};
  vm.runInNewContext(code, { exports, window: win, require: name => {
    if (name === 'react') return {
      useRef: () => ({ current: host }),
      useEffect: fn => effect = fn,
      useState: value => [value === "loading" ? initialStatus : value, next => states.push(next)],
    };
    if (name === 'next/navigation') return { useRouter: () => ({ prefetch() {}, push: url => pushes.push(url) }) };
    if (name === '@/lib/attribution') return { readAttribution: () => ({}) };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({type, props}), jsxs: (type, props) => ({type, props}) };
    throw new Error(name);
  }});
  const tree = exports.default({ formId: 'my8rCVz6', nextHref: '/booking' });
  const cleanup = effect();
  const message = (type, overrides = {}) => listeners.get('message')?.({
    origin: 'https://form.typeform.com', source: contentWindow, data: { type }, ...overrides,
  });
  const flush = () => {
    let count = 0;
    while (frames.size) {
      assert.ok(count++ < 5, 'animation work must finish');
      const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn());
    }
  };
  return { tree, attrs, frames, timers, listeners, scrolls, pushes, states, cleanup, message, flush };
}

const mobile = mount(true);
assert.equal(mobile.attrs['data-tf-auto-resize'], '664', 'mobile must have a floor but no clipping ceiling');
assert.equal(mobile.attrs['data-tf-disable-scroll'], 'true', 'swiping must not advance questions');
mobile.message('form-height-changed'); mobile.flush();
assert.equal(mobile.scrolls.length, 0, 'ordinary height changes must not steal user scroll');
mobile.message('form-screen-changed'); mobile.message('form-height-changed'); mobile.flush();
assert.equal(mobile.scrolls.length, 1, 'question and resize events must coalesce');
assert.equal(mobile.scrolls[0].behavior, 'instant');
mobile.message('form-submit', { origin: 'https://typeform.com.evil.example' });
mobile.message('form-submit', { source: {} });
assert.equal(mobile.pushes.length, 0, 'unrelated frames and lookalike origins must not navigate');
mobile.message('form-ready');
assert.ok(mobile.states.includes('ready'));
mobile.message('form-submit');
assert.deepEqual(mobile.pushes, [], 'submit must not bypass Typeform qualification endings');
assert.ok(mobile.tree.props.children.some(child => child?.props?.['data-tf-redirect-target'] === '_top'), 'qualified ending redirects at top level through the SDK');
mobile.message('form-screen-changed'); mobile.cleanup(); mobile.flush();
assert.equal(mobile.scrolls.length, 1, 'cleanup cancels pending scrolling');
assert.equal(mobile.listeners.size, 0);
assert.equal(mobile.timers.size, 0);

const desktop = mount(false);
assert.equal(desktop.attrs['data-tf-auto-resize'], '320,900');
assert.equal(desktop.attrs['data-tf-disable-scroll'], undefined);
desktop.message('form-screen-changed'); desktop.flush();
assert.equal(desktop.scrolls.length, 0, 'desktop navigation remains unchanged');
desktop.cleanup();
const failed = mount(true, 'failed');
assert.ok(failed.tree.props.children.some(child => child?.props?.['data-tf-widget'] === 'my8rCVz6' && child.props.hidden === true), 'timed-out embed remains mounted for recovery');
failed.message('form-ready');
assert.ok(failed.states.includes('ready'), 'a late ready event can restore the form');
failed.cleanup();
console.log('PASS: late-load recovery, mobile sizing, swipe behavior, transition coalescing, event validation, qualification ending preservation, cleanup, desktop behavior');
