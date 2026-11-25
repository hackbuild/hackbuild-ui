// Bubble lifetime: reading time, held while the voice speaks.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bubbleTtl, bubbleTimer } from "../../src/vanilla/bubble.ts";

test("reading time is 1.5 s plus 60 ms a character", () => {
  assert.equal(bubbleTtl("hello"), 1800);
  assert.equal(bubbleTtl("  "), 1500);
});

test("a hold keeps the bubble; release restarts the clock", async () => {
  let gone = 0;
  const t = bubbleTimer(() => gone++, 20);
  t.hold(true);
  t.show("hi");
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(gone, 0);
  t.hold(false);
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(gone, 1);
  t.dispose();
});

test("clamp slides the bubble in from the edges and keeps the tail on the point", async () => {
  const { clampBubble } = await import("../../src/vanilla/bubble.ts");
  const b = clampBubble(10, 150, 200, 60, 360, 200, 8);
  assert.equal(b.x, 108);
  assert.equal(b.below, false);
  assert.equal(b.tail, -88);
  const r = clampBubble(355, 150, 200, 60, 360, 200, 8);
  assert.equal(r.x, 252);
  const mid = clampBubble(180, 150, 200, 60, 360, 200, 8);
  assert.deepEqual(mid, { x: 180, y: 150, below: false, tail: 0 });
});

test("no room above: the bubble hangs under the point; no room at all keeps it in", async () => {
  const { clampBubble } = await import("../../src/vanilla/bubble.ts");
  const b = clampBubble(180, 20, 200, 60, 360, 200, 8);
  assert.equal(b.below, true);
  assert.equal(b.y, 20);
  const tight = clampBubble(180, 40, 200, 60, 360, 90, 8);
  assert.equal(tight.below, false);
  assert.equal(tight.y, 78);
  const wide = clampBubble(50, 150, 400, 60, 360, 200, 8);
  assert.equal(wide.x, 180);
});
