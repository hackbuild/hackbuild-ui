// barMore: the overflow of a one row toolbar.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { barFit, barMore } from "../../src/vanilla/bar.ts";

const HTML = `<div class="hb-bar is-overflow"><button id="a">restart</button><div class="hb-bar-more"><button class="hb-bar-more-btn" id="m">more</button>
<div class="hb-bar-more-panel" id="p"><input id="seed"><label>body<input type="file" hidden></label><button id="rec">record</button></div></div></div><p id="out">x</p>`;

test("the button opens the panel and focuses its first control; Escape returns focus", () => {
  const d = dom(HTML);
  const seen = [];
  const h = barMore(d.$(".hb-bar-more"), { onToggle: (o) => seen.push(o) });
  assert.equal(d.$("#m").getAttribute("aria-expanded"), "false");
  assert.equal(d.$("#m").getAttribute("aria-controls"), "p");
  d.click(d.$("#m"));
  assert.equal(h.isOpen, true);
  assert.ok(d.$(".hb-bar-more").classList.contains("is-open"));
  assert.equal(d.$("#m").getAttribute("aria-expanded"), "true");
  assert.equal(d.document.activeElement, d.$("#seed"));
  d.key(d.$("#seed"), "Escape");
  assert.equal(h.isOpen, false);
  assert.equal(d.document.activeElement, d.$("#m"));
  assert.deepEqual(seen, [true, false]);
  h.dispose();
  d.close();
});

test("a press outside closes; a press inside does not", () => {
  const d = dom(HTML);
  const h = barMore(d.$(".hb-bar-more"));
  h.open();
  d.pointerdown(d.$("#rec"));
  assert.equal(h.isOpen, true);
  d.pointerdown(d.$("#out"));
  assert.equal(h.isOpen, false);
  h.dispose();
  d.close();
});

// barFit: happy-dom lays nothing out, so the row width comes from a stub:
// each item in the row is 50 px, the bar is `w` px.
const ROW = `<div class="hb-bar is-overflow" id="bar"><button id="a">a</button><button id="b">b</button><!--v-if--><button id="c">c</button>
<div class="hb-bar-more"><button class="hb-bar-more-btn">more</button><div class="hb-bar-more-panel" id="p"><input id="seed"></div></div>
<span class="hb-spacer"></span><button id="tune">tune</button></div>`;
const stub = (d, w) => {
  Object.defineProperty(d.$("#bar"), "clientWidth", { configurable: true, get: () => w.value });
  return (bar) => [...bar.children].filter((c) => c.tagName === "BUTTON").length * 50 > w.value;
};

test("barFit folds under the width and spills the row from its end, the end slot stays", () => {
  const d = dom(ROW);
  const w = { value: 800 };
  const seen = [];
  const f = barFit(d.$("#bar"), { overflows: stub(d, w), onChange: (s) => seen.push(s) });
  assert.equal(f.folded, false);
  assert.equal(d.$("#bar").classList.contains("is-folded"), false);
  w.value = 110;
  f.fit();
  assert.equal(f.folded, true);
  assert.equal(f.spilled, 2);
  assert.deepEqual([...d.$("#p").children].map((c) => c.id), ["b", "c", "seed"]);
  assert.equal(d.$("#tune").parentElement, d.$("#bar"));
  w.value = 700;
  f.fit();
  assert.equal(f.spilled, 0);
  assert.deepEqual([...d.$("#bar").childNodes].filter((n) => n.nodeType !== 3).map((n) => n.id ?? n.nodeName).slice(0, 4), ["a", "b", "#comment", "c"]);
  assert.deepEqual(seen.map((s) => `${s.folded} ${s.spilled}`), ["true 2", "false 0"]);
  f.dispose();
  d.close();
});

test("barFit folds a bar whose row would wrap even when it is wide", () => {
  const d = dom(ROW);
  const w = { value: 700 };
  const f = barFit(d.$("#bar"), { overflows: () => true });
  Object.defineProperty(d.$("#bar"), "clientWidth", { configurable: true, get: () => w.value });
  f.fit();
  assert.equal(f.folded, true);
  f.dispose();
  assert.equal(d.$("#bar").classList.contains("is-folded"), false);
  d.close();
});

test("barMore fits its bar by default and marks an empty panel", () => {
  const d = dom(`<div class="hb-bar is-overflow"><button>a</button><div class="hb-bar-more"><button class="hb-bar-more-btn">m</button><div class="hb-bar-more-panel"></div></div></div>`);
  const h = barMore(d.$(".hb-bar-more"));
  assert.ok(h.fit);
  assert.ok(d.$(".hb-bar-more").classList.contains("is-none"));
  h.dispose();
  assert.equal(d.$(".hb-bar-more").classList.contains("is-none"), false);
  const off = barMore(d.$(".hb-bar-more"), { fit: false });
  assert.equal(off.fit, null);
  off.dispose();
  d.close();
});
