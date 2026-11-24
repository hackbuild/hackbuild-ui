// Toast store: one transient at a time, errors held until dismissed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { toastStore } from "../../src/vanilla/toast.ts";

function fakeTimers() {
  const q = new Map(); let n = 0;
  return { set: (fn) => { q.set(++n, fn); return n; }, clear: (id) => q.delete(id), flush: () => { for (const [id, fn] of [...q]) { q.delete(id); fn(); } } };
}

test("a transient toast replaces the last and goes after its time", () => {
  const t = fakeTimers();
  const s = toastStore(3, t);
  s.toast("one");
  s.toast("two", { kind: "ok" });
  assert.equal(s.state.current.message, "two");
  assert.equal(s.state.current.kind, "ok");
  t.flush();
  assert.equal(s.state.current, null);
});

test("errors are held, capped, and leave only on dismiss", () => {
  const t = fakeTimers();
  const s = toastStore(2, t);
  const seen = [];
  s.subscribe((x) => seen.push(x.held.length));
  const a = s.toast("a", { kind: "err" });
  s.toast("b", { kind: "err", action: { label: "redo", run() {} } });
  s.toast("c", { kind: "err" });
  t.flush();
  assert.deepEqual(s.state.held.map((x) => x.message), ["b", "c"]);
  assert.equal(s.state.held[0].action.label, "redo");
  s.dismiss(s.state.held[0].id);
  assert.deepEqual(s.state.held.map((x) => x.message), ["c"]);
  s.dismiss(a);
  assert.equal(s.state.held.length, 1);
  assert.ok(seen.length >= 4);
});
