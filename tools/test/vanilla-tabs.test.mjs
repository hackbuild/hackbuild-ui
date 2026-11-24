// tabs: roving focus, arrows with wrap, Home and End, panels, dispose.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { tabs } from "../../src/vanilla/tabs.ts";

const HTML = `<nav class="hb-tabs" aria-label="views">
  <button role="tab" data-value="a" aria-controls="pa">a</button>
  <button role="tab" data-value="b" aria-controls="pb">b</button>
  <button role="tab" data-value="c" aria-controls="pc" aria-disabled="true">c</button>
  <button role="tab" data-value="d" aria-controls="pd">d</button>
</nav><div id="pa"></div><div id="pb"></div><div id="pc"></div><div id="pd"></div>`;

test("first tab selected, one tab in the tab order, others' panels hidden", () => {
  const d = dom(HTML);
  const h = tabs(d.$(".hb-tabs"));
  const t = [...d.document.querySelectorAll("[role=tab]")];
  assert.equal(h.value, "a");
  assert.deepEqual(t.map((x) => x.tabIndex), [0, -1, -1, -1]);
  assert.equal(d.$("#pa").hidden, false);
  assert.equal(d.$("#pb").hidden, true);
  h.dispose();
  d.close();
});

test("arrows move, skip disabled, wrap; Home and End jump; onChange fires", () => {
  const d = dom(HTML);
  const seen = [];
  const h = tabs(d.$(".hb-tabs"), { onChange: (v) => seen.push(v) });
  const t = [...d.document.querySelectorAll("[role=tab]")];
  t[0].focus();
  d.key(t[0], "ArrowRight");
  assert.equal(h.value, "b");
  assert.equal(d.document.activeElement, t[1]);
  d.key(t[1], "ArrowRight");
  assert.equal(h.value, "d", "disabled c is skipped");
  d.key(t[3], "ArrowRight");
  assert.equal(h.value, "a", "wraps to the start");
  d.key(t[0], "ArrowLeft");
  assert.equal(h.value, "d", "wraps to the end");
  d.key(t[3], "Home");
  assert.equal(h.value, "a");
  d.key(t[0], "End");
  assert.equal(h.value, "d");
  assert.deepEqual(seen, ["b", "d", "a", "d", "a", "d"]);
  assert.equal(d.$("#pd").hidden, false);
  h.dispose();
  d.close();
});

test("aria-selected in markup picks the start; click selects; dispose stops keys", () => {
  const d = dom(HTML.replace('data-value="b"', 'data-value="b" aria-selected="true"'));
  const h = tabs(d.$(".hb-tabs"));
  assert.equal(h.value, "b");
  const t = [...d.document.querySelectorAll("[role=tab]")];
  d.click(t[3]);
  assert.equal(h.value, "d");
  d.click(t[2]);
  assert.equal(h.value, "d", "a disabled tab does not take a click");
  h.dispose();
  d.key(t[3], "Home");
  assert.equal(h.value, "d");
  d.close();
});

test("vertical strips use up and down", () => {
  const d = dom(HTML.replace('class="hb-tabs"', 'class="hb-tabs" aria-orientation="vertical"'));
  const h = tabs(d.$(".hb-tabs"));
  const t = [...d.document.querySelectorAll("[role=tab]")];
  d.key(t[0], "ArrowRight");
  assert.equal(h.value, "a");
  d.key(t[0], "ArrowDown");
  assert.equal(h.value, "b");
  h.dispose();
  d.close();
});
