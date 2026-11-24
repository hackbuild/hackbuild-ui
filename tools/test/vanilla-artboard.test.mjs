// Artboard view maths, layer mapping, snaps and the erase stroke.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fitScale, boardRect, toBoard, zoomAt, wheelFactor, pinch, toLayer, fromLayer, layerCorners, hitLayer,
  snapRot, snapTo, zoomWord, addStrokePoint, applyStroke, artViewKey, ART_KEYS, ART_FIT,
} from "../../src/vanilla/artboard.ts";

const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);

test("fit leaves the pad and centres the board", () => {
  assert.equal(fitScale(432, 332, 200, 100, 16), 2);
  const r = boardRect(ART_FIT, 432, 332, 200, 100, 2);
  assert.deepEqual(r, { left: 16, top: 66, scale: 2 });
  assert.deepEqual(toBoard(216, 166, r), { x: 100, y: 50 });
  assert.equal(fitScale(10, 10, 0, 0), 1);
});

test("zoom keeps the board point under the cursor", () => {
  const v = zoomAt(ART_FIT, 2, 100, 80, 432, 332, 200, 100, 2);
  assert.equal(v.zoom, 2);
  const before = toBoard(100, 80, boardRect(ART_FIT, 432, 332, 200, 100, 2));
  const after = toBoard(100, 80, boardRect(v, 432, 332, 200, 100, 2));
  near(before.x, after.x); near(before.y, after.y);
  assert.equal(zoomAt(ART_FIT, 100, 0, 0, 432, 332, 200, 100, 2, 0.25, 16).zoom, 16);
  assert.equal(zoomAt(ART_FIT, 0.001, 0, 0, 432, 332, 200, 100, 2, 0.25, 16).zoom, 0.25);
});

test("wheel down zooms out, lines count as 16 px, ctrl moves faster", () => {
  assert.ok(wheelFactor(100) < 1 && wheelFactor(-100) > 1);
  near(wheelFactor(1, 1), wheelFactor(16));
  assert.ok(wheelFactor(-10, 0, true) > wheelFactor(-10));
});

test("pinch reads the spread and the midpoint", () => {
  const g = pinch({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 10, y: 0 }, { x: 210, y: 0 });
  assert.equal(g.factor, 2);
  assert.deepEqual(g.mid0, { x: 50, y: 0 });
  assert.deepEqual(g.mid1, { x: 110, y: 0 });
});

test("layer pixels survive move, scale and rotate", () => {
  const L = { w: 40, h: 20, transform: { x: 100, y: 50, scale: 2, rot: 90 } };
  const b = fromLayer(L, 30, 5);
  const p = toLayer(L, b.x, b.y);
  near(p.x, 30); near(p.y, 5);
  const c = layerCorners({ w: 40, h: 20, transform: { x: 100, y: 50, scale: 1, rot: 0 } });
  assert.deepEqual(c, [{ x: 80, y: 40 }, { x: 120, y: 40 }, { x: 120, y: 60 }, { x: 80, y: 60 }]);
});

test("hit test takes the top layer and skips hidden and locked", () => {
  const t = { x: 50, y: 50, scale: 1, rot: 0 };
  const a = { id: "a", kind: "image", w: 40, h: 40, transform: t };
  const b = { id: "b", kind: "image", w: 20, h: 20, transform: t };
  assert.equal(hitLayer([a, b], 50, 50).id, "b");
  assert.equal(hitLayer([a, b], 35, 35).id, "a");
  assert.equal(hitLayer([a, { ...b, hidden: true }], 50, 50).id, "a");
  assert.equal(hitLayer([{ ...a, locked: true }], 50, 50), null);
  assert.equal(hitLayer([a], 0, 0), null);
});

test("rotation wraps and snaps", () => {
  assert.equal(snapRot(182), 180);
  assert.equal(snapRot(-178), 180);
  assert.equal(snapRot(87), 90);
  assert.equal(snapRot(87, false, true), 87);
  assert.equal(snapRot(37, true), 30);
  assert.equal(snapRot(370), 10);
});

test("centre guide snaps unless alt", () => {
  assert.deepEqual(snapTo(98, 100, 3), { v: 100, snapped: true });
  assert.deepEqual(snapTo(98, 100, 3, true), { v: 98, snapped: false });
  assert.deepEqual(snapTo(90, 100, 3), { v: 90, snapped: false });
});

test("words and keys", () => {
  assert.equal(zoomWord(1.5), "150%");
  assert.equal(artViewKey("="), "in");
  assert.equal(artViewKey("-"), "out");
  assert.equal(artViewKey("0"), "fit");
  assert.equal(artViewKey("1"), "actual");
  assert.equal(artViewKey("x"), null);
  assert.equal(ART_KEYS.e, "erase");
});

test("stroke points thin out under a fifth of the brush", () => {
  const pts = [];
  assert.ok(addStrokePoint(pts, { x: 0, y: 0 }, 10));
  assert.ok(!addStrokePoint(pts, { x: 1, y: 1 }, 10));
  assert.ok(addStrokePoint(pts, { x: 3, y: 0 }, 10));
  assert.equal(pts.length, 2);
});

test("erase paints over, restore cuts out, dabs fill the gap", () => {
  const calls = [];
  const ctx = {
    globalCompositeOperation: "source-over", fillStyle: "",
    beginPath() {}, fill() { calls.push(this.globalCompositeOperation); },
    arc(x, y, r) { calls.push([x, y, r]); },
  };
  applyStroke(ctx, { id: 1, tool: "erase", size: 4, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }] }, 2);
  assert.equal(calls[1], "source-over");
  assert.deepEqual(calls[0], [0, 0, 4]);
  assert.deepEqual(calls[calls.length - 2], [20, 0, 4]);
  assert.ok(calls.length / 2 >= 10);
  calls.length = 0;
  applyStroke(ctx, { id: 1, tool: "restore", size: 4, points: [{ x: 1, y: 1 }] });
  assert.equal(calls[1], "destination-out");
  assert.equal(ctx.globalCompositeOperation, "source-over");
});
