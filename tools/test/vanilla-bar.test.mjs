// barMore: the overflow of a one row toolbar.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { barMore } from "../../src/vanilla/bar.ts";

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
