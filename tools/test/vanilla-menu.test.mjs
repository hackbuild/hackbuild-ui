// menu: open from the trigger, arrows, letters, Escape, outside press, select.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { menu } from "../../src/vanilla/menu.ts";

const HTML = `<div class="hb-menu-wrap"><button id="t">file</button>
<div class="hb-menu" id="mn"><button class="hb-menu-item" data-value="new">new</button><button class="hb-menu-item" disabled>open</button><button class="hb-menu-item">rename</button><button class="hb-menu-item">export</button></div></div><p id="out">x</p>`;

test("trigger opens and focuses the first item; arrows wrap and skip disabled", () => {
  const d = dom(HTML);
  const h = menu(d.$(".hb-menu-wrap"));
  const items = [...d.document.querySelectorAll(".hb-menu-item")];
  assert.equal(d.$("#mn").hidden, true);
  assert.equal(d.$("#t").getAttribute("aria-haspopup"), "menu");
  d.click(d.$("#t"));
  assert.equal(h.isOpen, true);
  assert.equal(d.$("#t").getAttribute("aria-expanded"), "true");
  assert.equal(d.document.activeElement, items[0]);
  d.key(items[0], "ArrowDown");
  assert.equal(d.document.activeElement, items[2], "disabled open is skipped");
  d.key(items[2], "End");
  assert.equal(d.document.activeElement, items[3]);
  d.key(items[3], "ArrowDown");
  assert.equal(d.document.activeElement, items[0]);
  d.key(items[0], "ArrowUp");
  assert.equal(d.document.activeElement, items[3]);
  d.key(items[3], "r");
  assert.equal(d.document.activeElement, items[2]);
  d.key(items[2], "Escape");
  assert.equal(h.isOpen, false);
  assert.equal(d.document.activeElement, d.$("#t"));
  h.dispose();
  d.close();
});

test("ArrowUp on the trigger opens at the last item; select reports data-value or text", () => {
  const d = dom(HTML);
  const picked = [];
  const h = menu(d.$(".hb-menu-wrap"), { onSelect: (v) => picked.push(v) });
  const items = [...d.document.querySelectorAll(".hb-menu-item")];
  d.key(d.$("#t"), "ArrowUp");
  assert.equal(d.document.activeElement, items[3]);
  d.click(items[3]);
  assert.equal(h.isOpen, false);
  h.open();
  d.click(items[1]);
  assert.equal(h.isOpen, true, "a disabled item does nothing");
  d.click(items[0]);
  assert.deepEqual(picked, ["export", "new"]);
  h.dispose();
  d.close();
});

test("a press outside closes without taking focus; dispose unbinds", () => {
  const d = dom(HTML);
  const h = menu(d.$(".hb-menu-wrap"));
  h.open();
  d.pointerdown(d.$("#out"));
  assert.equal(h.isOpen, false);
  h.dispose();
  d.click(d.$("#t"));
  assert.equal(h.isOpen, false);
  d.close();
});

test("onToggle reports open and close; toggle flips", () => {
  const d = dom(HTML);
  const seen = [];
  const h = menu(d.$(".hb-menu-wrap"), { onToggle: (o) => seen.push(o) });
  h.toggle();
  assert.equal(h.isOpen, true);
  d.key(d.document.activeElement, "Escape");
  assert.equal(d.document.activeElement, d.$("#t"), "Escape returns focus to the trigger");
  h.toggle();
  h.toggle();
  assert.deepEqual(seen, [true, false, true, false]);
  h.dispose();
  d.close();
});
