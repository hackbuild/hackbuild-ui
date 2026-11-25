// The hackle parts views asked for: each class has its rule in the stylesheet
// and a row in GUIDELINES, and HbInset carries the who switch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../src/styles/hackbuild.css", import.meta.url), "utf8");
const md = readFileSync(new URL("../../GUIDELINES.md", import.meta.url), "utf8");
const inset = readFileSync(new URL("../../src/components/HbInset.vue", import.meta.url), "utf8");

const rule = (sel) => {
  const i = css.indexOf(`${sel}{`);
  assert.ok(i >= 0, `${sel} has no rule`);
  return css.slice(i, css.indexOf("}", i));
};

test("the pink heat fills by --v from 6 to 96 percent", () => {
  assert.match(rule(".hb-heat.is-pink td"), /var\(--hb-pink\) calc\(\(\.06 \+ var\(--v, 0\) \* \.9\) \* 100%\)/);
  assert.match(rule(".hb-heat.is-pink td.is-hi"), /color:var\(--hb-paper\)/);
});

test("marker, note and rack stack carry hackle's sizes", () => {
  assert.match(rule(".hb-marker"), /font-family:var\(--hb-display\); font-size:28px/);
  assert.match(rule(".hb-note"), /font-family:var\(--hb-note\); font-size:13px/);
  assert.match(rule(".hb-rack-stack"), /gap:16px/);
});

test("the current gauge label is pink and the inset head has a who switch", () => {
  assert.match(rule(".hb-gauge.is-cur .hb-gauge-label"), /color:var\(--hb-pink\)/);
  assert.match(rule('.hb-inset-who > button[aria-pressed="true"]'), /text-decoration:underline/);
  assert.match(inset, /class="hb-inset-who"/);
  assert.match(inset, /defineModel<string>\('sees'/);
});

test("every new class has a GUIDELINES row", () => {
  for (const c of [".hb-heat.is-pink", ".hb-marker", ".hb-note", ".hb-rack-stack", ".hb-gauge.is-cur", ".hb-inset-who"]) assert.ok(md.includes("`" + c + "`"), c);
});

test("a lit stage keeps its glow inside a layout subject", () => {
  assert.match(rule(".hb-stage-lit"), /--hb-stage-lit-bg:/);
  assert.match(rule(".hb-lay-subject.hb-stage-lit"), /background:var\(--hb-stage-lit-bg\)/);
  // the subject rule comes later in the file, so the lit rule must be later still
  assert.ok(css.lastIndexOf(".hb-lay-subject.hb-stage-lit{") > css.indexOf(".hb-lay-subject{"));
});

test("avatar card and clip strip have their parts and a play state", () => {
  for (const c of [".hb-avcard", ".hb-avcard-thumb", ".hb-avcard-meta", ".hb-avcard-rig", ".hb-avcard-rig.is-bad"]) rule(c);
  assert.match(rule(".hb-clipstrip-item.is-playing > button"), /var\(--hb-pink\)/);
  const card = readFileSync(new URL("../../src/components/HbAvatarCard.vue", import.meta.url), "utf8");
  const strip = readFileSync(new URL("../../src/components/HbClipStrip.vue", import.meta.url), "utf8");
  assert.match(card, /class="hb-avcard-rig" :class="props.rig.ok \? 'is-ok' : 'is-bad'"/);
  assert.match(strip, /'is-playing': props.playing === c.id/);
  for (const p of ["HbAvatarCard", "HbClipStrip"]) assert.ok(md.includes("`" + p + "`"), p);
});

test("views pass classes", () => {
  assert.match(rule(".hb-lay [hidden]"), /display:none !important/);
  assert.match(rule(".hb-lay-scroll"), /overflow:auto/);
  assert.match(rule(".hb-mask.is-fill .hb-mask-frame"), /width:var\(--hb-mask-w, 100%\)/);
  assert.match(rule(".hb-flow > * + *"), /margin-top:6px/);
  assert.match(rule(".hb-heat td[aria-current]"), /outline:2px solid var\(--hb-ink\)/);
  rule(".hb-frameview");
  for (const c of [".hb-lay-scroll", ".hb-mask.is-fill", ".hb-flow", ".hb-heat td[aria-current]", ".hb-frameview"]) assert.ok(md.includes(c), c);
});
