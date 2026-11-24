// context menu: clamp, menu key, right click, long press, panel keys, focus return.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { clampMenu, isMenuKey, stepIndex, contextTrigger, ctxPanel } from "../../src/vanilla/ctxmenu.ts";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("clampMenu keeps the menu inside the box", () => {
  assert.deepEqual(clampMenu({ x: 10, y: 10 }, { w: 100, h: 80 }, { w: 400, h: 300 }), { x: 18, y: 18 });
  assert.deepEqual(clampMenu({ x: 390, y: 290 }, { w: 100, h: 80 }, { w: 400, h: 300 }), { x: 292, y: 212 });
  assert.deepEqual(clampMenu({ x: 50, y: 50 }, { w: 500, h: 500 }, { w: 400, h: 300 }), { x: 0, y: 0 });
});

test("menu key and shift+f10 open; f10 alone does not", () => {
  assert.equal(isMenuKey({ key: "ContextMenu" }), true);
  assert.equal(isMenuKey({ key: "F10", shiftKey: true }), true);
  assert.equal(isMenuKey({ key: "F10" }), false);
  assert.equal(isMenuKey({ key: "Enter", shiftKey: true }), false);
});

test("stepIndex wraps and jumps", () => {
  assert.equal(stepIndex("ArrowDown", -1, 3), 0);
  assert.equal(stepIndex("ArrowDown", 2, 3), 0);
  assert.equal(stepIndex("ArrowUp", 0, 3), 2);
  assert.equal(stepIndex("End", 0, 3), 2);
  assert.equal(stepIndex("Home", 2, 3), 0);
  assert.equal(stepIndex("x", 0, 3), -1);
  assert.equal(stepIndex("ArrowDown", -1, 0), -1);
});

test("right click opens at the point, menu key opens on the focused element", () => {
  const d = dom(`<div id="a" tabindex="0"><button id="b">mug</button></div>`);
  const got = [];
  const t = contextTrigger(d.$("#a"), { onOpen: (at, via, target) => got.push([via, target.id]) });
  const e = new d.window.MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 30, clientY: 40 });
  d.$("#b").dispatchEvent(e);
  assert.equal(e.defaultPrevented, true);
  assert.deepEqual(got[0], ["mouse", "b"]);
  const k = d.key(d.$("#b"), "F10", { shiftKey: true });
  assert.equal(k.defaultPrevented, true);
  assert.deepEqual(got[1], ["key", "b"]);
  d.key(d.$("#a"), "ContextMenu");
  assert.deepEqual(got[2], ["key", "a"]);
  d.key(d.$("#a"), "F10");
  assert.equal(got.length, 3);
  t.dispose();
  d.close();
});

test("long press on touch opens once and eats the click after it; a drag cancels", async () => {
  const d = dom(`<div id="a"></div>`);
  const got = [];
  const a = d.$("#a");
  const t = contextTrigger(a, { longPress: 20, onOpen: (at, via) => got.push(via) });
  const pe = (type, x, y) => a.dispatchEvent(new d.window.PointerEvent(type, { bubbles: true, cancelable: true, pointerType: "touch", clientX: x, clientY: y }));
  pe("pointerdown", 5, 5);
  await wait(40);
  assert.deepEqual(got, ["touch"]);
  // The phone's own contextmenu during the same hold does not open a second.
  a.dispatchEvent(new d.window.MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  assert.deepEqual(got, ["touch"]);
  pe("pointerup", 5, 5);
  const c = new d.window.MouseEvent("click", { bubbles: true, cancelable: true });
  a.dispatchEvent(c);
  assert.equal(c.defaultPrevented, true, "the click after the press is eaten");
  // A drag past the slop is not a press.
  pe("pointerdown", 5, 5);
  pe("pointermove", 40, 5);
  await wait(40);
  assert.deepEqual(got, ["touch"]);
  // Lifting early is a tap.
  pe("pointerdown", 5, 5);
  pe("pointerup", 5, 5);
  await wait(40);
  assert.deepEqual(got, ["touch"]);
  t.dispose();
  d.close();
});

test("a mouse press does not start a long press", async () => {
  const d = dom(`<div id="a"></div>`);
  const got = [];
  const a = d.$("#a");
  const t = contextTrigger(a, { longPress: 10, onOpen: (at, via) => got.push(via) });
  a.dispatchEvent(new d.window.PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }));
  await wait(30);
  assert.equal(got.length, 0);
  t.dispose();
  d.close();
});

test("panel: focus first, arrows skip disabled, pick closes and returns focus", () => {
  const d = dom(`<div id="a" tabindex="0"><div class="hb-ctx" id="p"><button class="hb-menu-item">pick it up</button><button class="hb-menu-item" disabled>give</button><button class="hb-menu-item">look at it</button></div></div><p id="o">x</p>`);
  const picked = [];
  let closed = 0;
  const h = ctxPanel(d.$("#p"), { onPick: (el) => picked.push(el.textContent), onClose: () => closed++ });
  const items = [...d.document.querySelectorAll(".hb-menu-item")];
  assert.equal(d.$("#p").hidden, true);
  assert.equal(d.$("#p").getAttribute("role"), "menu");
  h.show({ x: 10, y: 10 }, { w: 400, h: 300 }, d.$("#a"));
  assert.equal(h.isOpen, true);
  assert.equal(items[0].getAttribute("role"), "menuitem");
  assert.equal(d.document.activeElement, items[0]);
  assert.equal(d.$("#p").style.left, "18px");
  d.key(items[0], "ArrowDown");
  assert.equal(d.document.activeElement, items[2]);
  d.key(items[2], "p");
  assert.equal(d.document.activeElement, items[0]);
  d.click(items[2]);
  assert.deepEqual(picked, ["look at it"]);
  assert.equal(h.isOpen, false);
  assert.equal(d.$("#p").hidden, true);
  assert.equal(d.document.activeElement, d.$("#a"));
  assert.equal(closed, 1);
  h.dispose();
  d.close();
});

test("panel: escape returns focus, tab and outside press close without it", () => {
  const d = dom(`<div id="a" tabindex="0"><div class="hb-ctx" id="p"><button class="hb-menu-item">one</button></div></div><button id="o">x</button>`);
  const h = ctxPanel(d.$("#p"));
  const item = d.$(".hb-menu-item");
  h.show({ x: 0, y: 0 }, { w: 100, h: 100 }, d.$("#a"));
  d.key(item, "Escape");
  assert.equal(h.isOpen, false);
  assert.equal(d.document.activeElement, d.$("#a"));
  h.show({ x: 0, y: 0 }, { w: 100, h: 100 }, d.$("#a"));
  d.key(item, "Tab");
  assert.equal(h.isOpen, false);
  h.show({ x: 0, y: 0 }, { w: 100, h: 100 }, d.$("#a"));
  d.$("#o").dispatchEvent(new d.window.Event("pointerdown", { bubbles: true }));
  assert.equal(h.isOpen, false);
  h.dispose();
  d.close();
});
