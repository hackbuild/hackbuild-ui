// persisted, undoStack, activity and copier: the stores with no markup.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { persisted } from "../../src/vanilla/persisted.ts";
import { undoStack } from "../../src/vanilla/undo.ts";
import { activity } from "../../src/vanilla/activity.ts";
import { copier } from "../../src/vanilla/copy.ts";

test("persisted: initial when empty, writes a versioned record, reads it back", () => {
  const d = dom();
  const storage = d.window.localStorage;
  const a = persisted("hb:tab", "chat", { storage });
  assert.equal(a.get(), "chat");
  a.set("memory");
  assert.deepEqual(JSON.parse(storage.getItem("hb:tab")), { v: 1, value: "memory" });
  const b = persisted("hb:tab", "chat", { storage });
  assert.equal(b.get(), "memory");
  b.update((v) => v + "!");
  b.reset();
  assert.equal(b.get(), "chat");
  assert.equal(storage.getItem("hb:tab"), null);
  a.dispose();
  b.dispose();
  d.close();
});

test("persisted: bad JSON and an old version give the initial value; migrate moves it", () => {
  const d = dom();
  const storage = d.window.localStorage;
  storage.setItem("k", "{not json");
  assert.equal(persisted("k", 3, { storage }).get(), 3);
  storage.setItem("k", JSON.stringify({ v: 1, value: { size: 10 } }));
  assert.deepEqual(persisted("k", { size: 1, unit: "mm" }, { storage, version: 2 }).get(), { size: 1, unit: "mm" });
  const m = persisted("k", { size: 1, unit: "mm" }, { storage, version: 2, migrate: (old, from) => (from === 1 ? { ...old, unit: "mm" } : undefined) });
  assert.deepEqual(m.get(), { size: 10, unit: "mm" });
  d.close();
});

test("persisted: a failing store keeps the value for the tab and names it", () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem() {} };
  const p = persisted("k", 1, { storage, sync: false });
  p.set(2);
  assert.equal(p.get(), 2);
  assert.match(p.error, /full or blocked/);
  assert.match(persisted("k", 1, { storage: null }).error, /blocked/);
});

test("persisted: subscribers hear sets", () => {
  const d = dom();
  const p = persisted("k", 0, { storage: d.window.localStorage, sync: false });
  const seen = [];
  const off = p.subscribe((v) => seen.push(v));
  p.set(1);
  off();
  p.set(2);
  assert.deepEqual(seen, [1]);
  d.close();
});

test("undoStack: undo and redo swap with the present; push clears redo; limit drops the oldest", () => {
  const s = undoStack(3);
  let doc = "a";
  for (const next of ["b", "c", "d", "e"]) { s.push(doc); doc = next; }
  assert.deepEqual(s.sizes, { undo: 3, redo: 0 });
  doc = s.undo(doc);
  assert.equal(doc, "d");
  doc = s.undo(doc);
  assert.equal(doc, "c");
  doc = s.redo(doc);
  assert.equal(doc, "d");
  assert.equal(s.canRedo, true);
  s.push(doc);
  doc = "x";
  assert.equal(s.canRedo, false);
  assert.equal(s.undo(doc), "d");
  s.clear();
  assert.equal(s.undo("y"), undefined);
  assert.equal(s.redo("y"), undefined);
});

function clock() {
  let t = 0;
  const timers = new Map();
  let id = 0;
  return {
    now: () => t,
    setTimer: (fn, ms) => (timers.set(++id, { fn, at: t + ms }), id),
    clearTimer: (i) => timers.delete(i),
    advance(ms) {
      t += ms;
      for (const [i, x] of [...timers]) if (x.at <= t) { timers.delete(i); x.fn(); }
    },
  };
}

test("activity: a task that ends inside its delay never appears", async () => {
  const c = clock();
  const a = activity(c);
  const seen = [];
  a.subscribe((l) => seen.push(l.length));
  let finish;
  const run = a.track("load", "loading", () => new Promise((r) => (finish = r)), 200);
  c.advance(100);
  finish("ok");
  assert.equal(await run, "ok");
  c.advance(500);
  assert.deepEqual(seen, []);
  assert.deepEqual(a.list(), []);
});

test("activity: a slow task appears after its delay and ends", async () => {
  const c = clock();
  const a = activity(c);
  let finish;
  const run = a.track("load", "loading", () => new Promise((r) => (finish = r)), 200);
  c.advance(250);
  assert.equal(a.list()[0].label, "loading");
  finish(1);
  await run;
  assert.deepEqual(a.list(), []);
});

test("activity: set on a known key keeps started; the list is oldest first", () => {
  const c = clock();
  const a = activity(c);
  a.set("b", "voice", 0.1);
  c.advance(10);
  a.set("a", "model");
  c.advance(10);
  a.set("b", "voice", 0.5);
  assert.deepEqual(a.list().map((t) => [t.key, t.started, t.fraction]), [["b", 0, 0.5], ["a", 10, null]]);
});

test("activity: cancel then restart of one key leaves one record; the old run clears nothing", async () => {
  const c = clock();
  const a = activity(c);
  let cancelled = 0;
  let first;
  const one = a.track("dl", "download", () => new Promise((r) => (first = r)));
  a.set("dl", "download", 0.2, () => cancelled++);
  a.cancel("dl");
  assert.equal(cancelled, 1);
  let second;
  const two = a.track("dl", "download again", () => new Promise((r) => (second = r)));
  first();
  await one;
  assert.equal(a.list().length, 1);
  assert.equal(a.list()[0].label, "download again");
  second();
  await two;
  assert.deepEqual(a.list(), []);
});

test("activity: an error keeps the record with its message", async () => {
  const a = activity(clock());
  await assert.rejects(a.track("x", "reading", async () => { throw new Error("file is not a glb"); }), /not a glb/);
  assert.equal(a.list()[0].error, "file is not a glb");
  a.end("x");
  assert.deepEqual(a.list(), []);
  a.dispose();
});

test("copier: copied on success, failed when the clipboard and fallback fail, idle after", async () => {
  const wrote = [];
  const ok = copier({ resetMs: 5, clipboard: { writeText: async (t) => { wrote.push(t); } } });
  assert.equal(await ok.copy("seed 42"), true);
  assert.equal(ok.state, "copied");
  assert.deepEqual(wrote, ["seed 42"]);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(ok.state, "idle");
  const bad = copier({ clipboard: { writeText: async () => { throw new Error("denied"); } }, doc: { body: null } });
  assert.equal(await bad.copy("x"), false);
  assert.equal(bad.state, "failed");
  ok.dispose();
  bad.dispose();
});
