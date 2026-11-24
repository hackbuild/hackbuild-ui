// Prompt mapping, hover throttle, instance colours, dual range, split keys.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  containRect, toImage, toView, normBox, isBox, nudge, promptStep, promptWord, hoverThrottle,
  instanceColour, INSTANCE_COLOURS, scorePct, clampPair, rangePct, splitKey, splitAt, PROMPT_KEYS,
} from "../../src/vanilla/vision.ts";

test("contain fit letterboxes the short side", () => {
  assert.deepEqual(containRect({ width: 400, height: 400 }, 800, 400), { left: 0, top: 100, width: 400, height: 200 });
  assert.deepEqual(containRect({ width: 400, height: 400 }, 400, 800), { left: 100, top: 0, width: 200, height: 400 });
});

test("a pointer maps to image pixels, the letterbox gives null", () => {
  const el = { left: 10, top: 20, width: 400, height: 400 };
  assert.deepEqual(toImage(210, 220, el, 800, 400), { x: 400, y: 200 });
  assert.deepEqual(toImage(10, 120, el, 800, 400), { x: 0, y: 0 });
  assert.equal(toImage(210, 30, el, 800, 400), null);
  assert.deepEqual(toImage(210, 30, el, 800, 400, true), { x: 400, y: 0 });
  const v = toView(400, 200, el, 800, 400);
  assert.equal(v.left, 50);
  assert.equal(v.top, 50);
});

test("boxes order their corners, clamp, and a short drag is a tap", () => {
  assert.deepEqual(normBox({ x: 90, y: 5 }, { x: -3, y: 60.6 }, 80, 50), { x0: 0, y0: 5, x1: 80, y1: 50 });
  assert.equal(isBox({ x0: 0, y0: 0, x1: 3, y1: 30 }), false);
  assert.equal(isBox({ x0: 0, y0: 0, x1: 4, y1: 4 }), true);
});

test("keyboard nudges stay on the image, steps scale with it", () => {
  assert.deepEqual(nudge({ x: 2, y: 5 }, -10, 3, 100, 100), { x: 0, y: 8 });
  assert.equal(promptStep(1024, 768), 10);
  assert.equal(promptStep(1024, 768, true), 102);
  assert.equal(promptStep(40, 30), 1);
  assert.equal(PROMPT_KEYS.n, "negative");
  assert.equal(promptWord({ kind: "point", x: 10.4, y: 20, positive: false }), "leave out point at 10, 20");
  assert.equal(promptWord({ kind: "box", x0: 1, y0: 2, x1: 30, y1: 40, positive: true }), "keep box 1, 2 to 30, 40");
});

test("hover fires at most every 50 ms and lands the last point", () => {
  let t = 0;
  const timers = [];
  const clock = { now: () => t, set: (f, d) => { const o = { f, at: t + d }; timers.push(o); return o; }, clear: (o) => { o.f = null; } };
  const got = [];
  const h = hoverThrottle((v) => got.push(v), 50, clock);
  h(1); t = 10; h(2); t = 20; h(3);
  assert.deepEqual(got, [1]);
  t = 50; timers.forEach((o) => o.f && o.at <= t && (o.f(), (o.f = null)));
  assert.deepEqual(got, [1, 3]);
  t = 200; h(4);
  assert.deepEqual(got, [1, 3, 4]);
  t = 210; h(5); h.cancel(); t = 400; timers.forEach((o) => o.f && o.f());
  assert.deepEqual(got, [1, 3, 4]);
});

test("instance colours cycle ten, scores clamp", () => {
  assert.equal(INSTANCE_COLOURS.length, 10);
  assert.equal(instanceColour(0), instanceColour(10));
  assert.equal(instanceColour(-1), INSTANCE_COLOURS[9]);
  assert.equal(scorePct(1.01), "100%");
  assert.equal(scorePct(0.874), "87%");
  assert.equal(scorePct(-0.2), "0%");
  assert.equal(scorePct(undefined), "");
});

test("a dual range holds the moved thumb against the other", () => {
  assert.deepEqual(clampPair(0.25, 1, { step: 0.01 }), [0.25, 1]);
  assert.deepEqual(clampPair(0.9, 0.5, { moved: "lo" }), [0.5, 0.5]);
  assert.deepEqual(clampPair(0.4, 0.2, { moved: "hi" }), [0.4, 0.4]);
  assert.deepEqual(clampPair(0.5, 0.55, { gap: 0.1, moved: "hi" }), [0.5, 0.6]);
  assert.deepEqual(clampPair(0.95, 1, { gap: 0.1, moved: "lo" }), [0.9, 1]);
  assert.deepEqual(clampPair(1, 1, { gap: 0.1, moved: "hi" }), [0.9, 1]);
  assert.deepEqual(clampPair(-5, 300, { min: 0, max: 255, step: 1 }), [0, 255]);
  assert.equal(rangePct(64, 0, 256), 25);
});

test("split keys move the divider and stop at the edges", () => {
  assert.equal(splitKey("ArrowRight", 0.5), 0.55);
  assert.equal(splitKey("ArrowLeft", 0.5, true), 0.49);
  assert.equal(splitKey("ArrowLeft", 0.02), 0);
  assert.equal(splitKey("End", 0.3), 1);
  assert.equal(splitKey("PageUp", 0.9), 1);
  assert.equal(splitKey("a", 0.5), null);
  assert.equal(splitAt(150, { left: 50, width: 200 }), 0.5);
  assert.equal(splitAt(0, { left: 50, width: 200 }), 0);
});
