// Chat: split replies, stats words, composer keys, pinned scroll, the context budget, list times.
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitParts, statsText, clip, argsLine, composerKey, pinned, contextUse, relTime, listMeta } from "../../src/vanilla/chat.ts";

test("a reply splits on blank lines, at most 5 boxes, nothing dropped", () => {
  assert.deepEqual(splitParts("a\n\nb\n\n\nc"), ["a", "b", "c"]);
  assert.deepEqual(splitParts("1\n\n2\n\n3\n\n4\n\n5\n\n6\n\n7"), ["1", "2", "3", "4", "5\n\n6\n\n7"]);
  assert.deepEqual(splitParts("one\nline"), ["one\nline"]);
});

test("stats carry their source word", () => {
  assert.equal(statsText({ tokPerSec: 41.27, firstMs: 420, tokens: 38 }), "41.3 tok/s, first word 0.42 s, 38 tok (measured)");
  assert.equal(statsText({ tokens: 5, source: "inferred" }), "5 tok (inferred)");
  assert.equal(statsText(null), "");
});

test("args cut at 80 with three dots", () => {
  assert.equal(clip("abcdef", 5), "ab...");
  assert.equal(argsLine({ a: "x".repeat(100) }).length, 80);
});

const k = (key, o = {}) => ({ key, shiftKey: false, isComposing: false, altKey: false, ctrlKey: false, metaKey: false, ...o });
test("enter sends on a fine pointer and adds a line on a coarse one", () => {
  assert.equal(composerKey(k("Enter"), {}), "send");
  assert.equal(composerKey(k("Enter", { shiftKey: true }), {}), null);
  assert.equal(composerKey(k("Enter", { isComposing: true }), {}), null);
  assert.equal(composerKey(k("Enter"), { coarse: true }), null);
  assert.equal(composerKey(k("Enter", { ctrlKey: true }), { coarse: true }), "send");
  assert.equal(composerKey(k("Enter"), { busy: true }), null);
});

test("escape stops a reply; up in an empty composer edits the last turn", () => {
  assert.equal(composerKey(k("Escape"), { busy: true }), "stop");
  assert.equal(composerKey(k("Escape"), {}), null);
  assert.equal(composerKey(k("ArrowUp"), { empty: true }), "edit-last");
  assert.equal(composerKey(k("ArrowUp"), { empty: false }), null);
});

test("pinned within 80 px of the bottom", () => {
  assert.equal(pinned({ scrollHeight: 1000, scrollTop: 560, clientHeight: 400 }), true);
  assert.equal(pinned({ scrollHeight: 1000, scrollTop: 300, clientHeight: 400 }), false);
});

test("the context budget by source with its tone", () => {
  const u = contextUse([{ key: "a", label: "a", tokens: 1000 }, { key: "b", label: "b", tokens: 2096 }], 4096);
  assert.equal(u.used, 3096);
  assert.equal(u.tone, "warn");
  assert.equal(u.words, "3,096 of 4,096 tok, 76%");
  assert.equal(contextUse([{ key: "a", label: "a", tokens: 4000 }], 4096).tone, "full");
  assert.equal(contextUse([{ key: "a", label: "a", tokens: 9000 }], 4096).fraction, 1);
});

test("relative times for the chats rail", () => {
  const now = Date.UTC(2026, 10, 24, 12);
  assert.equal(relTime(now - 10e3, now), "just now");
  assert.equal(relTime(now - 12 * 60e3, now), "12 min ago");
  assert.equal(relTime(now - 3 * 3600e3, now), "3 h ago");
  assert.equal(relTime(now - 2 * 86400e3, now), "2 d ago");
  assert.equal(relTime(now - 40 * 86400e3, now), "2026-10-15");
});

test("listMeta names kind, when and count, leaving out what a row lacks", () => {
  const now = Date.UTC(2026, 10, 24, 12, 0);
  assert.equal(listMeta({ updated: now - 4 * 60e3, count: 12 }, now), "4 min ago, 12 msg");
  assert.equal(listMeta({ updated: now - 3 * 3600e3, kind: "sketch" }, now), "sketch, 3 h ago");
  assert.equal(listMeta({ updated: now, kind: "", count: 0 }, now), "just now, 0 msg");
});
