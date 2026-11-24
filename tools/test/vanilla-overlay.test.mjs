// modal and drawer: focus in, Tab trap, Escape, scrim, return focus, stack.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { drawer, modal } from "../../src/vanilla/overlay.ts";

const HTML = `<button id="opener">open</button>
<div class="hb-modal" id="m"><div class="hb-panel"><button id="m1">one</button><input id="m2"><button id="mx" data-hb-close>close</button></div></div>
<div class="hb-drawer" id="d"><div class="hb-drawer-panel"><button id="d1">one</button><button id="d2">two</button></div></div>`;

test("modal: starts hidden, open focuses the first control, Escape closes and returns focus", () => {
  const d = dom(HTML);
  const reasons = [];
  const h = modal(d.$("#m"), { trigger: d.$("#opener"), onClose: (r) => reasons.push(r) });
  assert.equal(d.$("#m").hidden, true);
  d.$("#opener").focus();
  d.click(d.$("#opener"));
  assert.equal(h.isOpen, true);
  assert.equal(d.$("#opener").getAttribute("aria-expanded"), "true");
  assert.equal(d.document.activeElement, d.$("#m1"));
  assert.equal(d.document.body.style.overflow, "hidden");
  d.key(d.$("#m1"), "Escape");
  assert.equal(h.isOpen, false);
  assert.equal(d.$("#m").hidden, true);
  assert.equal(d.document.activeElement, d.$("#opener"));
  assert.equal(d.document.body.style.overflow, "");
  assert.deepEqual(reasons, ["escape"]);
  h.dispose();
  d.close();
});

test("modal: Tab wraps at both ends", () => {
  const d = dom(HTML);
  const h = modal(d.$("#m"));
  h.open();
  d.$("#mx").focus();
  const e = d.key(d.$("#mx"), "Tab");
  assert.equal(e.defaultPrevented, true);
  assert.equal(d.document.activeElement, d.$("#m1"));
  d.key(d.$("#m1"), "Tab", { shiftKey: true });
  assert.equal(d.document.activeElement, d.$("#mx"));
  d.$("#m1").focus();
  const mid = d.key(d.$("#m1"), "Tab");
  assert.equal(mid.defaultPrevented, false, "inside the panel the browser moves focus");
  h.dispose();
  d.close();
});

test("modal: scrim click and data-hb-close close; a panel click does not", () => {
  const d = dom(HTML);
  const reasons = [];
  const h = modal(d.$("#m"), { onClose: (r) => reasons.push(r) });
  h.open();
  d.click(d.$(".hb-panel"));
  assert.equal(h.isOpen, true);
  d.click(d.$("#m"));
  assert.equal(h.isOpen, false);
  h.open();
  d.click(d.$("#mx"));
  assert.equal(h.isOpen, false);
  assert.deepEqual(reasons, ["scrim", "button"]);
  h.dispose();
  d.close();
});

test("escape closes only the newest overlay; a key already taken is left alone", () => {
  const d = dom(HTML);
  const m = modal(d.$("#m"));
  const dr = drawer(d.$("#d"), { side: "left" });
  assert.equal(d.$("#d").classList.contains("is-left"), true);
  m.open();
  dr.open();
  d.key(d.document.activeElement, "Escape");
  assert.equal(dr.isOpen, false);
  assert.equal(m.isOpen, true);
  d.$("#m2").addEventListener("keydown", (e) => e.preventDefault());
  d.key(d.$("#m2"), "Escape");
  assert.equal(m.isOpen, true, "an inner widget took Escape");
  d.key(d.$("#m1"), "Escape");
  assert.equal(m.isOpen, false);
  assert.equal(d.document.body.style.overflow, "", "scroll lock count returns to zero");
  m.dispose();
  dr.dispose();
  d.close();
});

test("drawer: dialog role and label on the panel, dispose closes and unbinds", () => {
  const d = dom(HTML);
  const h = drawer(d.$("#d"), { label: "settings", open: true });
  const p = d.$(".hb-drawer-panel");
  assert.equal(p.getAttribute("role"), "dialog");
  assert.equal(p.getAttribute("aria-label"), "settings");
  assert.equal(d.document.activeElement, d.$("#d1"));
  h.dispose();
  assert.equal(d.$("#d").hidden, true);
  d.click(d.$("#d"));
  assert.equal(h.isOpen, false);
  d.close();
});

test("drawer: side bottom is the sheet, and one sheet is open at a time", () => {
  const d = dom(`<button id="o">open</button>
<div class="hb-drawer" id="s1"><div class="hb-drawer-panel"><button id="a">a</button></div></div>
<div class="hb-drawer" id="s2"><div class="hb-drawer-panel"><button id="b">b</button></div></div>
<div class="hb-drawer" id="r"><div class="hb-drawer-panel"><button id="c">c</button></div></div>`);
  const closed = [];
  const one = drawer(d.$("#s1"), { side: "bottom", label: "rack", onClose: (r) => closed.push("one " + r) });
  const two = drawer(d.$("#s2"), { side: "bottom" });
  const side = drawer(d.$("#r"), { side: "right" });
  assert.equal(d.$("#s1").classList.contains("is-sheet"), true);
  assert.equal(d.$("#s1").classList.contains("is-left"), false);
  assert.equal(d.$("#r").classList.contains("is-sheet"), false);
  assert.equal(d.$("#s1 .hb-drawer-panel").getAttribute("aria-label"), "rack");
  d.$("#o").focus();
  one.open();
  assert.equal(d.document.activeElement, d.$("#a"));
  two.open();
  assert.equal(one.isOpen, false, "opening a sheet closes the open one");
  assert.deepEqual(closed, ["one api"]);
  assert.equal(two.isOpen, true);
  assert.equal(d.document.activeElement, d.$("#b"));
  side.open();
  assert.equal(two.isOpen, true, "a side drawer does not close a sheet");
  d.key(d.$("#c"), "Escape");
  assert.equal(side.isOpen, false);
  assert.equal(two.isOpen, true);
  d.key(d.$("#b"), "Escape");
  assert.equal(two.isOpen, false);
  assert.equal(d.document.activeElement, d.$("#o"), "focus goes back to the first opener");
  assert.equal(d.document.body.style.overflow, "");
  two.dispose();
  one.open();
  assert.equal(one.isOpen, true, "a disposed sheet leaves the group");
  one.dispose();
  side.dispose();
  d.close();
});

test("modal: closeOnEscape false holds Escape over a drawer beneath", () => {
  const d = dom(HTML);
  const dr = drawer(d.$("#d"));
  const m = modal(d.$("#m"), { closeOnEscape: false });
  dr.open();
  m.open();
  const e = d.key(d.$("#m1"), "Escape");
  assert.equal(e.defaultPrevented, false);
  assert.equal(m.isOpen, true);
  assert.equal(dr.isOpen, true, "the key does not fall to the drawer");
  m.close();
  d.key(d.$("#d1"), "Escape");
  assert.equal(dr.isOpen, false);
  m.dispose();
  dr.dispose();
  d.close();
});

test("drawer: side auto is a sheet under the breakpoint and the right drawer from it, live", () => {
  const d = dom(`<div class="hb-drawer" id="s"><div class="hb-drawer-panel"><button id="a">a</button></div></div>
<div class="hb-drawer" id="x"><div class="hb-drawer-panel"><button id="b">b</button></div></div>`);
  d.window.happyDOM.setViewport({ width: 390, height: 800 });
  const sheet = drawer(d.$("#s"), { side: "bottom" });
  const auto = drawer(d.$("#x"), { side: "auto" });
  const el = d.$("#x");
  assert.equal(el.classList.contains("is-sheet"), true, "a sheet at 390");
  sheet.open();
  auto.open();
  assert.equal(sheet.isOpen, false, "as a sheet it closes the open sheet");
  auto.close();
  d.window.happyDOM.setViewport({ width: 1024, height: 800 });
  assert.equal(el.classList.contains("is-sheet"), false, "the right drawer at 1024");
  assert.equal(el.classList.contains("is-left"), false);
  sheet.open();
  auto.open();
  assert.equal(sheet.isOpen, true, "as a side drawer it leaves the sheet open");
  auto.dispose();
  d.window.happyDOM.setViewport({ width: 390, height: 800 });
  assert.equal(el.classList.contains("is-sheet"), false, "dispose stops following the width");
  const narrow = drawer(el, { side: "auto", breakpoint: 300 });
  assert.equal(el.classList.contains("is-sheet"), false, "breakpoint moves the switch");
  narrow.dispose();
  sheet.dispose();
  d.close();
});
