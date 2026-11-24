// Slot rack: preset words, jobs, the ready gate, one load at a time, the storage line.
import { test } from "node:test";
import assert from "node:assert/strict";
import { presetText, presetJobs, rackGate, rackQueue, storageText } from "../../src/vanilla/rack.ts";

const slots = [
  { slot: "brain", label: "brain", required: true },
  { slot: "embedder", label: "embedder", required: true },
  { slot: "ears", label: "ears" },
];
const preset = { id: "laptop", label: "laptop", picks: { brain: "b", embedder: "e", ears: "w" }, totalMB: 767, totalSource: "inferred" };

test("a preset states its total with the source word and any unknown size", () => {
  assert.equal(presetText(preset), "laptop, 767 MB (inferred)");
  assert.equal(presetText({ ...preset, totalMB: 2756, unknown: ["x"] }), "laptop, 2.7 GB (inferred), 1 size unknown");
});

test("a preset loads only the slots not already ready with the same pick", () => {
  assert.deepEqual(presetJobs(preset, slots, { brain: "b", embedder: "old" }, { brain: "ready", embedder: "ready" }), ["embedder", "ears"]);
});

test("the gate names the required slots that are not ready", () => {
  assert.deepEqual(rackGate(slots, { brain: "ready" }), { ready: false, missing: ["embedder"], note: "load embedder to enable. the rest can load later." });
  assert.equal(rackGate(slots, {}).note, "load brain and embedder to enable. the rest can load later.");
  assert.equal(rackGate(slots, { brain: "ready", embedder: "ready" }).ready, true);
});

test("the queue loads one slot at a time and moves on past a fault", () => {
  const calls = [];
  const q = rackQueue((s) => calls.push(s));
  q.push(["brain", "embedder", "ears"]);
  assert.deepEqual(calls, ["brain"]);
  q.settle("embedder", "ready");
  assert.deepEqual(calls, ["brain"], "only the current slot settles the queue");
  q.settle("brain", "loading");
  q.settle("brain", "fault");
  assert.deepEqual(calls, ["brain", "embedder"]);
  q.push(["embedder", "ears"]);
  assert.deepEqual(q.waiting, ["ears"], "no slot twice");
  q.clear();
  q.settle("embedder", "ready");
  assert.equal(q.current, null);
});

test("the storage line says whether the browser may clear it", () => {
  const GB = 1024 ** 3;
  assert.equal(storageText({ used: 1.9 * GB, quota: 12 * GB }), "1.9 GB of 12 GB used here. the browser may clear it. press keep to ask it not to.");
  assert.match(storageText({ used: 1.9 * GB, quota: null, persisted: true }), /kept: the browser will not clear it/);
  assert.equal(storageText({ used: null, quota: null }).startsWith("storage use unknown here."), true);
});
