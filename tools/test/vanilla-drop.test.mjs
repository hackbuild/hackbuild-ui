// dropRoutes: hover state with depth, route guess, grouping, reject, dispose.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { accepts, dropRoutes } from "../../src/vanilla/drop.ts";

function drag(d, target, type, files = [], items = files.map((f) => ({ kind: "file", type: f.type }))) {
  const e = new d.window.Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(e, "dataTransfer", { value: { types: ["Files"], files, items } });
  target.dispatchEvent(e);
  return e;
}
const file = (name, type = "") => ({ name, type });

test("accepts reads extensions, wildcards, exact types and tests", () => {
  assert.equal(accepts(".glb, .VRM", file("a.vrm")), true);
  assert.equal(accepts("image/*", file("x", "image/png")), true);
  assert.equal(accepts(["audio/wav"], file("x", "audio/mpeg")), false);
  assert.equal(accepts((f) => f.name.startsWith("k"), file("k.bin")), true);
});

test("hover state survives child enter and leave, overlay classes follow", () => {
  const d = dom(`<main id="t"><p id="c">x</p></main><div class="hb-dropzone is-cover" id="o"></div>`);
  const states = [];
  const h = dropRoutes(d.window, [{ name: "image", accept: "image/*", on() {} }], { overlay: d.$("#o"), onState: (s) => states.push(s) });
  const img = [file("a.png", "image/png")];
  const enter = drag(d, d.$("#t"), "dragenter", img);
  assert.equal(enter.defaultPrevented, true);
  drag(d, d.$("#c"), "dragenter", img);
  drag(d, d.$("#t"), "dragleave", img);
  assert.equal(h.state.over, true);
  assert.equal(h.state.route, "image");
  assert.equal(d.$("#o").classList.contains("is-over"), true);
  assert.equal(d.$("#o").dataset.route, "image");
  drag(d, d.$("#c"), "dragleave", img);
  assert.equal(h.state.over, false);
  assert.equal(d.$("#o").classList.contains("is-over"), false);
  assert.equal(states.length, 2, "one change in, one out");
  h.dispose();
  d.close();
});

test("a known type no route takes is rejected while hovering; unknown types are not", () => {
  const d = dom(`<main id="t"></main>`);
  const h = dropRoutes(d.window, [{ name: "image", accept: "image/*", on() {} }]);
  drag(d, d.$("#t"), "dragenter", [file("a.txt", "text/plain")]);
  assert.equal(h.state.rejected, true);
  drag(d, d.$("#t"), "drop", []);
  drag(d, d.$("#t"), "dragenter", [file("a.glb", "")]);
  assert.equal(h.state.rejected, false);
  assert.equal(h.state.route, null);
  h.dispose();
  d.close();
});

test("drop groups files per route in one call each; the rest go to onReject", () => {
  const d = dom(`<main id="t"></main>`);
  const got = {};
  const rejected = [];
  const h = dropRoutes(
    d.window,
    [
      { name: "model", accept: ".glb,.vrm", on: (fs) => (got.model = fs.map((f) => f.name)) },
      { name: "audio", accept: "audio/*", on: (fs) => (got.audio = fs.map((f) => f.name)) },
    ],
    { onReject: (fs) => rejected.push(...fs.map((f) => f.name)) },
  );
  const files = [file("a.glb"), file("b.wav", "audio/wav"), file("c.vrm"), file("d.txt", "text/plain")];
  const e = drag(d, d.$("#t"), "drop", files);
  assert.equal(e.defaultPrevented, true, "the browser does not open the file");
  assert.deepEqual(got, { model: ["a.glb", "c.vrm"], audio: ["b.wav"] });
  assert.deepEqual(rejected, ["d.txt"]);
  h.dispose();
  d.close();
});

test("drags with no files are left alone; enabled false ignores drops", () => {
  const d = dom(`<main id="t"></main>`);
  let calls = 0;
  let on = false;
  const h = dropRoutes(d.window, [{ name: "any", accept: () => true, on: () => calls++ }], { enabled: () => on });
  const e = new d.window.Event("dragenter", { bubbles: true, cancelable: true });
  Object.defineProperty(e, "dataTransfer", { value: { types: ["text/plain"], files: [], items: [] } });
  d.$("#t").dispatchEvent(e);
  assert.equal(e.defaultPrevented, false);
  drag(d, d.$("#t"), "drop", [file("a")]);
  assert.equal(calls, 0);
  on = true;
  drag(d, d.$("#t"), "drop", [file("a")]);
  assert.equal(calls, 1);
  h.dispose();
  drag(d, d.$("#t"), "drop", [file("a")]);
  assert.equal(calls, 1);
  d.close();
});

test("an element router keeps a handled drop from a window router", () => {
  const d = dom(`<main id="t"><div id="zone"></div></main>`);
  const seen = [];
  const w = dropRoutes(d.window, [{ name: "w", accept: () => true, on: () => seen.push("window") }]);
  const z = dropRoutes(d.$("#zone"), [{ name: "z", accept: ".png", on: () => seen.push("zone") }]);
  drag(d, d.$("#zone"), "drop", [file("a.png")]);
  drag(d, d.$("#zone"), "drop", [file("a.txt")]);
  assert.deepEqual(seen, ["zone", "window"]);
  w.dispose();
  z.dispose();
  d.close();
});
