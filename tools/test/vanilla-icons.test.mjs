// The stroke set: drawings on the 24 grid, the svg string, the element,
// and the Font Awesome class fallback name.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { strokeIcons, strokeIconNames, strokePortedNames, strokeIcon, strokeIconEl, faClassName } from "../../src/icons/stroke.ts";
import { iconNames } from "../../src/icons/index.ts";

test("every drawing stays on the 24 grid", () => {
  for (const name of strokeIconNames) {
    const nums = strokeIcons[name].d.match(/-?\d*\.?\d+/g) ?? [];
    assert.ok(nums.length > 0, name);
    for (const n of nums) assert.ok(Math.abs(Number(n)) <= 24, `${name} ${n}`);
  }
});

test("the ported names are in the set", () => {
  assert.equal(strokePortedNames.length, 16);
  for (const n of strokePortedNames) assert.ok(n in strokeIcons, n);
});

test("chrome names match the solid names they replace", () => {
  for (const n of ["x", "trash", "pen", "copy", "check", "undo", "redo", "microphone", "play", "pause", "menu", "eye", "thumbtack"]) {
    assert.ok(n in strokeIcons, n);
    assert.ok(iconNames.includes(n), n);
  }
});

test("svg string: square caps, mitre joins, currentColor, hidden without a label", () => {
  const s = strokeIcon("trash", { size: 20 });
  assert.match(s, /class="hb-icon is-stroke"/);
  assert.match(s, /stroke-linecap="square"/);
  assert.match(s, /stroke-linejoin="miter"/);
  assert.match(s, /stroke="currentColor"/);
  assert.match(s, /fill="none"/);
  assert.match(s, /width="20" height="20" viewBox="0 0 24 24"/);
  assert.match(s, /aria-hidden="true"/);
  assert.match(strokeIcon("x", { label: 'close "it"' }), /role="img" aria-label="close &quot;it&quot;"/);
  assert.equal(strokeIcon("no-such-icon"), "");
});

test("element form", () => {
  const { document, close } = dom();
  const el = strokeIconEl("gear", { className: "big" }, document);
  assert.equal(el.tagName.toLowerCase(), "svg");
  assert.equal(el.getAttribute("class"), "hb-icon is-stroke big");
  assert.equal(strokeIconEl("nope", {}, document), null);
  close();
});

test("font awesome class strings name the glyph", () => {
  assert.equal(faClassName("fa-solid fa-gear"), "gear");
  assert.equal(faClassName("fa fa-fw fa-lg fa-house"), "house");
  assert.equal(faClassName("fa-brands fa-github"), "github");
  assert.equal(faClassName("fa-solid"), undefined);
  assert.equal(faClassName("gear"), undefined);
});
