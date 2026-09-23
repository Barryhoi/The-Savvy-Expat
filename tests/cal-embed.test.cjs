const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../components/CalEmbed.tsx'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function mount({ existingReady = false } = {}) {
  let effect, status, id = 0;
  const timers = new Map(), listeners = new Map(), calls = [], pushes = [];
  const ns = (command, args) => {
    calls.push([command, args]);
    if (command === 'on') listeners.set(args.action, args.callback);
    if (command === 'off' && listeners.get(args.action) === args.callback) listeners.delete(args.action);
  };
  const Cal = () => {};
  Cal.ns = { test: ns };
  const media = { matches: false, addEventListener() {}, removeEventListener() {} };
  const exports = {};
  vm.runInNewContext(code, { exports,
    window: { setTimeout: fn => { timers.set(++id, fn); return id; }, clearTimeout: id => timers.delete(id), matchMedia: () => media },
    document: { getElementById: () => ({ querySelector: selector => selector.includes('loading="done"') && existingReady ? {} : null }) },
    require: name => {
      if (name === 'react') return { useEffect: fn => effect = fn, useRef: value => ({current:value}), useState: value => { status = value; return [value, next => status = typeof next === 'function' ? next(status) : next]; } };
      if (name === 'next/navigation') return { useRouter: () => ({prefetch(){}, push: url => pushes.push(url)}) };
      if (name === '@/lib/booking') return { CAL_ORIGIN: 'https://app.cal.com', ensureCalLoader: () => Cal };
      if (name === 'react/jsx-runtime') return {jsx: (type, props) => ({type,props}),jsxs: (type, props) => ({type,props})};
      throw Error(name);
    },
  });
  exports.default({calLink:'test',namespace:'test',nextHref:'/thank-you'});
  const cleanup = effect();
  return { calls, timers, listeners, pushes, cleanup, status:()=>status,
    emit: (action, data) => listeners.get(action)?.({ detail: { data } }),
    timeout: () => { const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn()); },
  };
}

test('an inserted but unready iframe times out; late readiness recovers it', () => {
  const c=mount(); assert.equal(c.status(),'loading'); c.timeout(); assert.equal(c.status(),'failed');
  c.emit('linkReady'); assert.equal(c.status(),'ready'); c.cleanup();
});
test('explicit vendor failure provides fallback immediately', () => {
  const c=mount(); c.emit('linkFailed',{code:404}); assert.equal(c.status(),'failed'); assert.equal(c.timers.size,0);c.cleanup();
});
test('readiness is subscribed before mounting and survives effect remount', () => {
  const c=mount({existingReady:true});assert.equal(c.status(),'ready');
  assert.ok(c.calls.findIndex(([k,a])=>k==='on'&&a.action==='linkReady')<c.calls.findIndex(([k])=>k==='inline'));c.cleanup();
});
test('confirmed booking navigates once; pending/payment events stay inside Cal', () => {
  const c=mount();
  c.emit('bookingSuccessful');c.emit('bookingSuccessful',{confirmed:false});c.emit('bookingSuccessful',{confirmed:true,booking:{paymentUid:'pending'}});
  assert.equal(c.pushes.length,0);c.emit('bookingSuccessful',{confirmed:true,booking:{uid:'test'}});c.emit('bookingSuccessful',{confirmed:true});
  assert.deepEqual(c.pushes,['/thank-you']);c.cleanup();
});
test('unmount removes handlers and makes already queued callbacks harmless', () => {
  const c=mount(); const ready=c.listeners.get('linkReady'),booked=c.listeners.get('bookingSuccessful');
  c.cleanup();assert.equal(c.listeners.size,0);assert.equal(c.timers.size,0);
  ready();booked({detail:{data:{confirmed:true}}});assert.equal(c.status(),'loading');assert.equal(c.pushes.length,0);
});

test('mobile retains event details and prevents slot autoscroll overshoot', () => {
  const c=mount();
  assert.equal(c.calls.find(([k])=>k==='ui')[1].hideEventTypeDetails,false);
  assert.equal(c.calls.find(([k])=>k==='inline')[1].config['ui.autoscroll'],'false');c.cleanup();
});
