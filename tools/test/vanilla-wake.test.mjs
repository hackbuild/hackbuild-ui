// Wake gate: the note from size, origin and quota; pills from the rows; the failure line.
import { test } from "node:test";
import assert from "node:assert/strict";
import { gateNote, wakePills, wakeSummary, wakeBar, wakeError } from "../../src/vanilla/wake.ts";

test("the note states size with its source, a file origin, and a small quota", () => {
  const n = gateNote({ sizeMB: 5427, sizeSource: "vendor", origin: "file", quotaMB: 4096, extras: "the voice and memory models" });
  assert.match(n.text, /first run downloads about 5.4 gb \(vendor\) for the brain, plus the voice and memory models\./);
  assert.match(n.text, /opened as a file/);
  assert.match(n.text, /only 4.1 gb of storage quota/);
  assert.equal(n.warn, true);
  assert.deepEqual(gateNote({ sizeMB: 300, quotaMB: 9000 }), { text: "first run downloads about 300 mb (unknown) for the brain. after that it loads from cache.", warn: false });
  assert.match(gateNote({ webgpu: false }).text, /^no webgpu here/);
});

const rows = [
  { id: "brain", label: "brain", state: "error", required: true, note: "failed: oom" },
  { id: "voice", label: "voice", state: "error", note: "pocket failed" },
  { id: "memory", label: "memory", state: "ready" },
  { id: "body", label: "body", state: "loading", pct: null },
];

test("a failed optional row is a warn pill, a failed required row an err pill", () => {
  assert.deepEqual(wakePills(rows).map((p) => p.state), ["err", "warn", "ok", "load"]);
  assert.equal(wakePills(rows)[1].title, "pocket failed");
});

test("the summary holds the gate on required rows only", () => {
  const s = wakeSummary(rows);
  assert.deepEqual(s.failed, ["brain"]);
  assert.deepEqual(s.degraded, ["voice"]);
  assert.equal(s.ready, false);
  assert.equal(s.busy, true);
  assert.equal(wakeSummary([{ id: "b", label: "b", state: "ready", required: true }, { id: "v", label: "v", state: "error" }]).ready, true);
});

test("bars fill by state and sweep when the total is unknown", () => {
  assert.equal(wakeBar(rows[3]), null);
  assert.equal(wakeBar({ id: "x", label: "x", state: "loading", pct: 0.42 }), 42);
  assert.equal(wakeBar({ id: "x", label: "x", state: "waiting" }), 0);
  assert.equal(wakeBar(rows[0]), 100);
});

test("the failure line names the subsystem, the error and the fixes", () => {
  assert.equal(wakeError("brain", "out of memory."), "the brain would not load: out of memory. pick a smaller model from the list, or open this page over http in desktop chrome.");
});
