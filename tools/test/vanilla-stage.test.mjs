// Stage caption, name hud words, the pad and the transport.
import { test } from "node:test";
import assert from "node:assert/strict";
import { captionText, hudWord } from "../../src/vanilla/stage.ts";
import { pad, stickVector, snap8, keyVector, dirWord } from "../../src/vanilla/pad.ts";
import { nextRate, rateText, chapterAt, chapterStep, chapterSpans, timeLine, transportKeys, idleChrome } from "../../src/vanilla/transport.ts";

test("caption keeps the tail, cut at a word", () => {
  assert.equal(captionText("  hello   there "), "hello there");
  const long = "one two three four five six seven eight nine ten";
  const c = captionText(long, 20);
  assert.ok(c.startsWith("… "));
  assert.ok(long.endsWith(c.slice(2)));
  assert.ok(!c.slice(2).startsWith(" "));
  assert.equal(captionText(long, 0), long);
});

test("hud word falls back to idle", () => {
  assert.equal(hudWord("talking"), "talking");
  assert.equal(hudWord("dancing"), "idle");
  assert.equal(hudWord(undefined), "idle");
});

test("stick: dead zone, clamp, rescale", () => {
  assert.deepEqual(stickVector(5, 0, 100), { x: 0, y: 0 });
  assert.deepEqual(stickVector(300, 0, 100), { x: 1, y: 0 });
  const v = stickVector(0, -56, 100, 0.12);
  assert.equal(v.x, 0); assert.equal(v.y, -0.5);
  assert.deepEqual(stickVector(10, 10, 0), { x: 0, y: 0 });
});

test("d-pad snaps to eight directions; keys cancel and normalise", () => {
  assert.deepEqual(snap8({ x: 0.9, y: -0.2 }), { x: 1, y: 0 });
  assert.deepEqual(snap8({ x: 0.5, y: -0.5 }), { x: 0.707, y: -0.707 });
  assert.deepEqual(keyVector(["ArrowUp"]), { x: 0, y: -1 });
  assert.deepEqual(keyVector(["w", "d"]), { x: 0.707, y: -0.707 });
  assert.deepEqual(keyVector(["a", "d"]), { x: 0, y: 0 });
  assert.equal(dirWord({ x: 0.7, y: -0.7 }), "ne");
  assert.equal(dirWord({ x: 0, y: 0 }), "");
  assert.equal(dirWord({ x: -1, y: 0 }), "w");
});

function fakeEl() {
  const el = new EventTarget();
  el.props = {}; el.attrs = {}; el.captured = new Set();
  el.style = { setProperty: (k, v) => { el.props[k] = v; } };
  el.setAttribute = (k, v) => { el.attrs[k] = v; };
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
  el.setPointerCapture = (id) => el.captured.add(id);
  el.releasePointerCapture = (id) => el.captured.delete(id);
  el.hasPointerCapture = (id) => el.captured.has(id);
  return el;
}
const ptr = (type, id, x, y) => Object.assign(new Event(type), { pointerId: id, clientX: x, clientY: y, button: 0 });
const at = (ev, target) => Object.defineProperty(ev, "target", { value: target });
const key = (type, k, extra = {}) => Object.assign(new Event(type, { cancelable: true }), { key: k, code: "", ...extra });

test("pad captures the pointer, follows it outside, rests on release", () => {
  const el = fakeEl(); const moves = [];
  const h = pad(el, { onMove: (v) => moves.push(v) });
  el.dispatchEvent(ptr("pointerdown", 7, 100, 50));
  assert.ok(el.captured.has(7));
  assert.deepEqual(h.value(), { x: 1, y: 0 });
  el.dispatchEvent(ptr("pointermove", 8, 0, 50));
  assert.deepEqual(h.value(), { x: 1, y: 0 }, "a second pointer is ignored");
  el.dispatchEvent(ptr("pointermove", 7, 50, -400));
  assert.deepEqual(h.value(), { x: 0, y: -1 });
  assert.equal(el.attrs["data-dir"], "n");
  assert.equal(el.props["--hb-pad-y"], "-1");
  el.dispatchEvent(ptr("pointerup", 7, 50, -400));
  assert.deepEqual(h.value(), { x: 0, y: 0 });
  assert.ok(!el.captured.has(7));
  assert.equal(moves.length, 3);
  h.dispose();
});

test("pad keys on the element, window keys skip typing, action key", () => {
  const el = fakeEl(); const win = new EventTarget(); let acts = 0;
  const h = pad(el, { mode: "dpad", keys: true, keyTarget: win, actionKey: "e", onAction: () => acts++ });
  win.dispatchEvent(key("keydown", "ArrowRight"));
  win.dispatchEvent(key("keydown", "ArrowUp"));
  assert.deepEqual(h.value(), { x: 0.707, y: -0.707 });
  win.dispatchEvent(key("keyup", "ArrowUp"));
  assert.deepEqual(h.value(), { x: 1, y: 0 });
  win.dispatchEvent(key("keyup", "ArrowRight"));
  assert.deepEqual(h.value(), { x: 0, y: 0 });
  const input = { tagName: "INPUT", getAttribute: () => "text", closest: () => null, isContentEditable: false };
  win.dispatchEvent(at(key("keydown", "w"), input));
  win.dispatchEvent(key("keydown", "e"));
  assert.equal(acts, 1);
  h.dispose();
});

test("rates step and wrap", () => {
  assert.equal(nextRate(1), 1.5);
  assert.equal(nextRate(2), 0.25);
  assert.equal(nextRate(1, -1), 0.5);
  assert.equal(nextRate(0.75), 1);
  assert.equal(rateText(1.5), "1.5x");
  assert.equal(rateText(1), "1x");
});

test("chapters: current, previous with grace, next, spans", () => {
  const ch = [{ t: 0, label: "a" }, { t: 10, label: "b" }, { t: 25, label: "c" }];
  assert.equal(chapterAt(ch, 12), 1);
  assert.equal(chapterAt([{ t: 5, label: "x" }], 1), -1);
  assert.equal(chapterStep(ch, 12, 1, 40), 25);
  assert.equal(chapterStep(ch, 30, 1, 40), 40);
  assert.equal(chapterStep(ch, 15, -1), 10);
  assert.equal(chapterStep(ch, 11, -1), 0);
  assert.equal(chapterStep(ch, 1, -1), 0);
  assert.equal(chapterStep([], 1, 1), null);
  const s = chapterSpans(ch, 40);
  assert.deepEqual(s.map((x) => x.share), [0.25, 0.375, 0.375]);
  assert.equal(timeLine(12, 90), "00:12 / 01:30");
  assert.equal(timeLine(12, NaN), "00:12");
});

test("transport keys: space, escape, arrows; buttons and fields keep theirs", () => {
  const t = new EventTarget(); const log = [];
  const h = transportKeys(t, { toggle: () => log.push("t"), stop: () => log.push("s"), step: (d) => log.push(d) });
  const div = { tagName: "DIV", getAttribute: () => null, closest: () => null };
  const btn = { tagName: "BUTTON", getAttribute: () => null, closest: () => null };
  const range = { tagName: "INPUT", type: "range", getAttribute: (a) => (a === "type" ? "range" : null), closest: () => null };
  t.dispatchEvent(at(key("keydown", " "), div));
  t.dispatchEvent(at(key("keydown", " "), btn));
  t.dispatchEvent(at(key("keydown", "Escape"), div));
  t.dispatchEvent(at(key("keydown", "ArrowLeft"), div));
  t.dispatchEvent(at(key("keydown", "ArrowRight"), range));
  t.dispatchEvent(at(key("keydown", " ", { ctrlKey: true }), div));
  assert.deepEqual(log, ["t", "s", -1]);
  h.dispose();
});

test("idle chrome hides after rest and wakes on the pointer", async () => {
  const cls = new Set(); const el = new EventTarget();
  el.classList = { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)) };
  el.contains = () => false;
  let playing = true;
  const h = idleChrome(el, { ms: 20, when: () => playing });
  await new Promise((r) => setTimeout(r, 40));
  assert.ok(cls.has("is-idle"));
  el.dispatchEvent(new Event("pointermove"));
  assert.ok(!cls.has("is-idle"));
  playing = false;
  await new Promise((r) => setTimeout(r, 40));
  assert.ok(!cls.has("is-idle"), "never hides while paused");
  h.dispose();
});
