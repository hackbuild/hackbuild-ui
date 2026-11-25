// Mask editing: wand flood, polygon fill, brush dabs, outputs, and the
// controller's keys and history over a canvas with no 2d context.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import {
  MASK_TOOLS, maskHint, colourDistance, wandSelect, pointInPolygon, polygonFill, applySelection, rectFill, ellipseFill, morphMask, smoothMask,
  stampDisc, strokeSegment, invertMask, maskCoverage, nextBrushSize, maskRgba, tintRgba, parseRgb, maskEditor,
} from "../../src/vanilla/mask.ts";

// 8 by 4: left half red, right half blue, one red pixel cut off at 7,0.
function img() {
  const w = 8, h = 4, data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const red = x < 4 || (x === 7 && y === 0);
    data.set(red ? [200, 20, 20, 255] : [20, 20, 200, 255], o);
  }
  return { data, width: w, height: h };
}
const count = (a) => a.reduce((s, v) => s + (v ? 1 : 0), 0);

test("colour distance is a percent of the cube diagonal", () => {
  assert.equal(colourDistance(0, 0, 0, 0, 0, 0), 0);
  assert.ok(Math.abs(colourDistance(0, 0, 0, 255, 255, 255) - 100) < 0.01);
});

test("the wand floods neighbours by tolerance, or takes the colour everywhere", () => {
  const im = img();
  const sel = wandSelect(im, 1, 1, 6);
  assert.equal(count(sel), 16);
  assert.equal(sel[7], 0);
  assert.equal(count(wandSelect(im, 1, 1, 6, false)), 17);
  assert.equal(count(wandSelect(im, 1, 1, 100)), 32);
  assert.equal(count(wandSelect(im, -1, 1, 6)), 0);
  assert.equal(count(wandSelect(im, 8, 0, 6)), 0);
});

test("the wand floods a large image without blowing the stack", () => {
  const w = 600, h = 400;
  const im = { data: new Uint8ClampedArray(w * h * 4).fill(128), width: w, height: h };
  assert.equal(count(wandSelect(im, 300, 200, 0)), w * h);
});

test("polygon fill takes pixels whose centre is inside", () => {
  const sq = [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 6 }, { x: 2, y: 6 }];
  const sel = polygonFill(10, 10, sq);
  assert.equal(count(sel), 16);
  assert.equal(sel[2 * 10 + 2], 1);
  assert.equal(sel[6 * 10 + 6], 0);
  assert.equal(count(polygonFill(10, 10, sq.slice(0, 2))), 0);
  // off the image is clipped, a triangle keeps about half its box
  assert.equal(count(polygonFill(4, 4, [{ x: -5, y: -5 }, { x: 20, y: -5 }, { x: 20, y: 20 }, { x: -5, y: 20 }])), 16);
  const tri = count(polygonFill(100, 100, [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }]));
  assert.ok(Math.abs(tri - 5000) <= 100, String(tri));
  assert.equal(pointInPolygon(3, 3, sq), true);
  assert.equal(pointInPolygon(7, 3, sq), false);
});

test("fill agrees with the point test on a concave shape", () => {
  const u = [{ x: 1, y: 1 }, { x: 9, y: 1 }, { x: 9, y: 9 }, { x: 6, y: 9 }, { x: 6, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 9 }, { x: 1, y: 9 }];
  const sel = polygonFill(10, 10, u);
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) assert.equal(!!sel[y * 10 + x], pointInPolygon(x + 0.5, y + 0.5, u), `${x},${y}`);
});

test("selections add and erase, and count what changed", () => {
  const m = new Uint8Array(4);
  assert.equal(applySelection(m, Uint8Array.from([1, 1, 0, 0]), "add"), 2);
  assert.equal(applySelection(m, Uint8Array.from([1, 1, 0, 0]), "add"), 0);
  assert.equal(applySelection(m, Uint8Array.from([0, 1, 0, 0]), "erase"), 1);
  assert.deepEqual([...m], [255, 0, 0, 0]);
});

test("a dab is a disc, never under a pixel; a segment leaves no gaps", () => {
  const m = new Uint8Array(100);
  assert.equal(stampDisc(m, 10, 10, 5, 5, 0.1, "add"), 1);
  m.fill(0);
  stampDisc(m, 10, 10, 5, 5, 2, "add");
  assert.equal(count(m), 12);
  stampDisc(m, 10, 10, 5, 5, 2, "erase");
  assert.equal(count(m), 0);
  strokeSegment(m, 10, 10, { x: 0.5, y: 5.5 }, { x: 9.5, y: 5.5 }, 0.6, "add");
  for (let x = 0; x < 10; x++) assert.equal(m[5 * 10 + x], 255, String(x));
  assert.equal(stampDisc(m, 10, 10, -20, -20, 3, "add"), 0);
});

test("invert, coverage and brush steps", () => {
  const m = Uint8Array.from([0, 255, 255, 0]);
  assert.equal(maskCoverage(m), 0.5);
  assert.deepEqual([...invertMask(m)], [255, 0, 0, 255]);
  assert.equal(maskCoverage(new Uint8Array(0)), 0);
  assert.equal(nextBrushSize(24, 1), 29);
  assert.equal(nextBrushSize(3, -1), 1);
  assert.equal(nextBrushSize(198, 1), 200);
});

test("outputs: alpha, matte, cutout, tint", () => {
  const m = Uint8Array.from([255, 0]);
  assert.deepEqual([...maskRgba(m)], [255, 255, 255, 255, 255, 255, 255, 0]);
  assert.deepEqual([...maskRgba(m, "matte")], [255, 255, 255, 255, 0, 0, 0, 255]);
  const s = Uint8ClampedArray.from([1, 2, 3, 255, 4, 5, 6, 255]);
  assert.deepEqual([...maskRgba(m, "cutout", s)], [1, 2, 3, 255, 4, 5, 6, 0]);
  assert.throws(() => maskRgba(m, "cutout"));
  assert.deepEqual([...tintRgba(m, [254, 3, 134], 0.5)], [254, 3, 134, 128, 254, 3, 134, 0]);
  assert.deepEqual(parseRgb("#FE0386"), [254, 3, 134]);
  assert.deepEqual(parseRgb(" rgb(1, 2, 3)"), [1, 2, 3]);
  assert.deepEqual(parseRgb("#fff"), [255, 255, 255]);
});

test("one table gives the letters and hints, in both modes", () => {
  assert.deepEqual(MASK_TOOLS.map((t) => t.key), ["w", "b", "e", "l", "p", "m", "o", "g", "h"]);
  assert.equal(new Set(MASK_TOOLS.map((t) => t.key)).size, MASK_TOOLS.length);
  assert.match(maskHint("brush", "add"), /\[ and \]/);
  assert.match(maskHint("brush", "erase"), /x swaps to add/);
  for (const t of MASK_TOOLS) assert.equal(t.hint, maskHint(t.id, "add"));
});

test("controller: keys, history and edits in image pixels", async () => {
  const { document, key, close } = dom('<canvas id="c"></canvas>');
  const c = document.getElementById("c");
  let edits = 0;
  const h = maskEditor(c, { size: 24, onEdit: () => edits++ });
  assert.equal(c.style.touchAction, "none");
  await h.setImage(img());
  assert.equal(h.state.ready, true);
  assert.equal(c.width, 8);

  key(c, "b"); assert.equal(h.state.tool, "brush");
  key(c, "]"); assert.equal(h.state.size, 29);
  key(c, "["); key(c, "["); assert.equal(h.state.size, 19);
  key(c, "x"); assert.equal(h.state.mode, "erase");
  key(c, "x"); assert.equal(h.state.mode, "add");
  key(c, "w"); assert.equal(h.state.tool, "wand");

  h.wandAt(1, 1);
  assert.equal(h.state.coverage, 0.5);
  assert.equal(h.state.canUndo, true);
  h.wandAt(1, 1); // nothing new: no step
  h.lassoFill([{ x: 4, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 4 }, { x: 4, y: 4 }], "erase");
  h.paint([{ x: 6.5, y: 1.5 }, { x: 6.5, y: 2.5 }], 0.5);
  assert.equal(count(h.mask()), 18);
  assert.equal(edits, 2);

  const e = key(c, "z", { ctrlKey: true });
  assert.equal(e.defaultPrevented, true);
  assert.equal(count(h.mask()), 16);
  key(c, "z", { ctrlKey: true, shiftKey: true });
  assert.equal(count(h.mask()), 18);
  key(c, "z", { metaKey: true }); key(c, "z", { metaKey: true });
  assert.equal(count(h.mask()), 0);
  assert.equal(h.state.canUndo, false);
  key(c, "y", { ctrlKey: true });
  assert.equal(h.state.coverage, 0.5);

  h.invert();
  assert.equal(h.mask()[7], 255);
  assert.throws(() => h.setMask(new Uint8Array(3)));
  h.setMask(new Uint8Array(32));
  assert.equal(h.state.coverage, 0);
  h.dispose();
  key(c, "b");
  assert.equal(h.state.tool, "wand");
  close();
});

test("controller: letters are not taken from a text field", async () => {
  const { document, key, close } = dom('<div id="r"><input id="t"><canvas id="c"></canvas></div>');
  const h = maskEditor(document.getElementById("c"), { keys: document.getElementById("r") });
  key(document.getElementById("t"), "b");
  assert.equal(h.state.tool, "wand");
  key(document.getElementById("r"), "l");
  assert.equal(h.state.tool, "lasso");
  h.dispose();
  close();
});

test("rectangle, ellipse, expand, shrink and smooth in image pixels", () => {
  const r = rectFill(10, 10, { x: 2, y: 3 }, { x: 6, y: 5 });
  assert.equal(r.reduce((n, v) => n + (v ? 1 : 0), 0), 8);
  assert.equal(r[3 * 10 + 2], 255);
  assert.equal(r[5 * 10 + 6], 0);
  const e = ellipseFill(20, 20, { x: 0, y: 0 }, { x: 20, y: 20 });
  assert.equal(e[10 * 20 + 10], 255);
  assert.equal(e[0], 0);
  const one = new Uint8Array(25); one[12] = 255;
  const grown = morphMask(one, 5, 5, 1, true);
  assert.equal(grown.reduce((n, v) => n + (v ? 1 : 0), 0), 9);
  assert.equal(morphMask(grown, 5, 5, 1, false).reduce((n, v) => n + (v ? 1 : 0), 0), 1);
  const jag = rectFill(12, 12, { x: 2, y: 2 }, { x: 10, y: 10 }); jag[2 * 12 + 2] = 0; jag[6 * 12 + 11] = 255;
  const sm = smoothMask(jag, 12, 12, 1);
  assert.equal(sm[6 * 12 + 11], 0);
  assert.equal(sm[6 * 12 + 6], 255);
});

test("controller: the new tools by key, shapes, flood and morphology as undo steps", async () => {
  const { document, key, close } = dom('<canvas id="c"></canvas>');
  const c = document.getElementById("c");
  const h = maskEditor(c);
  await h.setImage(img());
  for (const [k, t] of [["e", "eraser"], ["p", "polygon"], ["m", "rect"], ["o", "ellipse"], ["g", "flood"], ["h", "pan"]]) { key(c, k); assert.equal(h.state.tool, t); }
  h.shapeFill({ x: 0, y: 0 }, { x: 2, y: 2 }, false, "add");
  assert.equal(count(h.mask()), 4);
  h.floodAt(1, 1, "add");
  assert.equal(h.state.coverage, 0.5);
  h.shrink(1);
  assert.ok(count(h.mask()) < 16);
  h.undo();
  assert.equal(count(h.mask()), 16);
  h.expand(1);
  assert.ok(count(h.mask()) > 16);
  h.smooth(1);
  assert.equal(h.state.canUndo, true);
  h.dispose();
  close();
});
