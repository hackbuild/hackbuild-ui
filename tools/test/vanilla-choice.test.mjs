// chipGroup, toolRail, toggleRow, palette and keyMap.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { chipGroup, toolRail, toggleRow } from "../../src/vanilla/choice.ts";
import { palette, keyMap } from "../../src/vanilla/palette.ts";
import { hotkeys } from "../../src/vanilla/hotkeys.ts";

const CHIPS = `<div id="g"><button data-value="a" data-key="t">thermal</button><button data-value="b" class="is-on">night</button><button data-value="c" disabled>sketch</button><button data-value="">off</button></div>`;

test("single chip group: radios, arrows skip disabled, letters choose", () => {
  const d = dom(CHIPS);
  const reg = hotkeys([], { target: d.window, mac: false });
  const seen = [];
  const h = chipGroup(d.$("#g"), { registry: reg, onChange: (v) => seen.push(v.join()) });
  const [a, b, , off] = d.document.querySelectorAll("button");
  assert.equal(d.$("#g").getAttribute("role"), "radiogroup");
  assert.equal(b.getAttribute("aria-checked"), "true");
  assert.equal(b.tabIndex, 0);
  assert.equal(a.tabIndex, -1);
  d.key(b, "ArrowRight");
  assert.deepEqual(h.value, [""], "disabled sketch is skipped to off");
  assert.equal(off.classList.contains("is-on"), true);
  d.key(d.document.body, "t");
  assert.deepEqual(h.value, ["a"]);
  assert.deepEqual(seen, ["", "a"]);
  h.dispose();
  reg.dispose();
  d.close();
});

test("multi chip group: toggles, off clears the rest", () => {
  const d = dom(CHIPS);
  const h = chipGroup(d.$("#g"), { multi: true, value: [] });
  const [a, b, , off] = d.document.querySelectorAll("button");
  d.click(a); d.click(b);
  assert.deepEqual(h.value, ["a", "b"]);
  assert.equal(a.getAttribute("aria-pressed"), "true");
  d.click(a);
  assert.deepEqual(h.value, ["b"]);
  d.click(off);
  assert.deepEqual(h.value, [""]);
  d.click(a);
  assert.deepEqual(h.value, ["a"], "a choice after off drops off");
  h.dispose();
  d.close();
});

test("tool rail: pressed state, arrows, letters from the same buttons, hint", () => {
  const d = dom(`<div id="r"><button data-tool="wand" data-key="w" data-hint="click a colour" aria-label="wand"></button><button data-tool="brush" data-key="b" data-hint="drag to paint" aria-label="brush"></button><p class="hb-toolrail-hint"></p></div>`);
  const reg = hotkeys([], { target: d.window, mac: false });
  const h = toolRail(d.$("#r"), { registry: reg });
  const [w, b] = d.document.querySelectorAll("button");
  assert.equal(h.value, "wand");
  assert.equal(w.getAttribute("aria-pressed"), "true");
  assert.equal(d.$(".hb-toolrail-hint").textContent, "click a colour");
  d.key(w, "ArrowDown");
  assert.equal(h.value, "brush");
  assert.equal(d.document.activeElement, b);
  d.key(d.document.body, "w");
  assert.equal(h.value, "wand");
  assert.deepEqual(reg.list()[0].items.map((i) => i.keys[0][0]), ["w", "b"]);
  h.dispose();
  assert.equal(reg.list().length, 0, "dispose unbinds the letters");
  reg.dispose();
  d.close();
});

test("toggle row flips on a press", () => {
  const d = dom(`<button id="t" aria-checked="false">blink</button>`);
  const seen = [];
  const h = toggleRow(d.$("#t"), (v) => seen.push(v));
  d.click(d.$("#t"));
  assert.equal(d.$("#t").getAttribute("aria-checked"), "true");
  assert.equal(d.$("#t").getAttribute("role"), "switch");
  assert.deepEqual(seen, [true]);
  h.dispose();
  d.close();
});

test("palette: ctrl+k opens, focus in the field, Enter runs and closes, Escape clears then closes", () => {
  const d = dom(`<button id="was">x</button><div class="hb-modal hb-palette" id="p"><div class="hb-panel"><input><div class="hb-palette-list"><div role="group"><button role="option" data-key="tool:vision">vision</button><button role="option" data-key="save">save now</button></div></div><p class="hb-palette-empty" hidden></p></div></div>`);
  const reg = hotkeys([], { target: d.window, mac: false });
  const ran = [];
  const h = palette(d.$("#p"), { registry: reg, onRun: (k) => ran.push(k) });
  d.$("#was").focus();
  assert.equal(d.$("#p").hidden, true);
  d.key(d.$("#was"), "k", { ctrlKey: true });
  assert.equal(h.isOpen, true);
  const input = d.$("#p input");
  assert.equal(d.document.activeElement, input);
  input.value = "save";
  input.dispatchEvent(new d.window.Event("input"));
  d.key(input, "Enter");
  assert.deepEqual(ran, ["save"]);
  assert.equal(h.isOpen, false);
  assert.equal(d.document.activeElement, d.$("#was"), "focus returns");
  d.key(d.$("#was"), "/");
  assert.equal(h.isOpen, true);
  assert.equal(input.value, "", "the field is cleared on open");
  input.value = "vis";
  input.dispatchEvent(new d.window.Event("input"));
  d.key(input, "Escape");
  assert.equal(h.isOpen, true, "first Escape clears the query");
  d.key(input, "Escape");
  assert.equal(h.isOpen, false);
  h.dispose();
  reg.dispose();
  d.close();
});

test("keyMap prints the registry and follows it; ctrl reads cmd on a Mac", () => {
  const d = dom(`<div id="m"></div>`);
  const reg = hotkeys([{ keys: ["/", "ctrl+k"], label: "commands", group: "shell", run() {} }], { target: d.window, mac: true });
  const h = keyMap(d.$("#m"), reg);
  assert.equal(d.$("#m h3").textContent, "shell");
  assert.deepEqual([...d.document.querySelectorAll("#m kbd")].map((k) => k.textContent), ["/", "cmd", "k"]);
  reg.add({ keys: "ctrl+s", label: "save now", group: "workspace", run() {} });
  assert.equal(d.document.querySelectorAll("#m section").length, 2);
  h.dispose();
  reg.dispose();
  d.close();
});
