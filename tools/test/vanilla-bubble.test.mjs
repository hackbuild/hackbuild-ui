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
