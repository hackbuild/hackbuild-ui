// Spoken words, method figures, camera faults, run history, seeds.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  spokenWords, toSpoken, spokenIndex, wordAtChar, methodMeta, qualitySquares,
  cameraFault, openCamera, closeCamera, historyPush, runMeta, rollSeed, parseSeed, nextSeed,
} from "../../src/vanilla/media.ts";

test("estimated words share the line evenly at about 2.2 a second", () => {
  const w = spokenWords("mic check one two", { rate: 1 });
  assert.equal(w.length, 4);
  assert.equal(w[0].char, 0);
  assert.equal(w[2].char, 10);
  assert.ok(Math.abs(w[1].start - 1 / 2.2) < 1e-9);
  const fast = spokenWords("a b", { rate: 2 });
  assert.ok(Math.abs(fast[1].start - 1 / 4.4) < 1e-9);
});

test("the active word follows time, then every word reads done", () => {
  const w = [{ text: "a", start: 0, end: 0.5 }, { text: "b", start: 0.5, end: 1 }, { text: "c", start: 1, end: 1.4 }];
  assert.equal(spokenIndex(w, null), -1);
  assert.equal(spokenIndex(w, -0.1), -1);
  assert.equal(spokenIndex(w, 0.2), 0);
  assert.equal(spokenIndex(w, 0.5), 1);
  assert.equal(spokenIndex(w, 1.2), 2);
  assert.equal(spokenIndex(w, 1.4), 3);
  assert.equal(spokenIndex([{ text: "x" }], 3), -1);
});

test("a boundary event lands on its word", () => {
  const w = toSpoken(["spit", "fire,", "rust"]);
  assert.deepEqual(w.map((x) => x.char), [0, 5, 11]);
  assert.equal(wordAtChar(w, 0), 0);
  assert.equal(wordAtChar(w, 7), 1);
  assert.equal(wordAtChar(w, 11), 2);
});

test("method figures name time and size, download says so", () => {
  assert.deepEqual(methodMeta({ time: "~15 s", sizeMB: 120, state: "download" }), ["~15 s", "download 120 MB"]);
  assert.deepEqual(methodMeta({ time: "instant", sizeMB: 0 }), ["instant", "no download"]);
  assert.deepEqual(methodMeta({ sizeMB: 1700, state: "stored" }), ["1.7 GB"]);
  assert.deepEqual(qualitySquares(2), [true, true, false]);
  assert.deepEqual(qualitySquares(9), [true, true, true]);
});

test("camera faults name the way around", () => {
  assert.equal(cameraFault({ name: "NotAllowedError" }).kind, "denied");
  assert.match(cameraFault({ name: "NotAllowedError" }).text, /upload a file/);
  assert.equal(cameraFault({ name: "NotFoundError" }).kind, "missing");
  assert.equal(cameraFault({ name: "NotReadableError" }).kind, "busy");
  assert.equal(cameraFault({ name: "Weird", message: "Boom." }).text, "camera failed: boom. upload a file instead.");
});

test("open camera rejects as unsupported with no media devices, close stops tracks", async () => {
  await assert.rejects(openCamera(true, {}), (e) => cameraFault(e).kind === "unsupported");
  let asked = null;
  const s = await openCamera(true, { getUserMedia: async (c) => { asked = c; return "stream"; } });
  assert.equal(s, "stream");
  assert.deepEqual(asked, { video: true, audio: false });
  let stopped = 0;
  closeCamera({ getTracks: () => [{ stop: () => stopped++ }, { stop: () => stopped++ }] });
  assert.equal(stopped, 2);
});

test("history keeps newest first, moves a repeat, caps", () => {
  let h = [];
  for (let i = 1; i <= 10; i++) h = historyPush(h, { id: i });
  assert.deepEqual(h.map((x) => x.id), [10, 9, 8, 7, 6, 5, 4, 3]);
  h = historyPush(h, { id: 5 });
  assert.deepEqual(h.map((x) => x.id).slice(0, 3), [5, 10, 9]);
  assert.equal(h.length, 8);
  assert.equal(runMeta({ model: "sd turbo", seed: 12345, steps: 1, ms: 1840 }), "sd turbo, seed 12345, 1 step, 1.8 s");
});

test("seeds roll in range, parse strictly, hold when locked", () => {
  assert.equal(rollSeed(() => 0), 0);
  assert.equal(rollSeed(() => 0.999999999999), 4294967294);
  assert.equal(parseSeed(" 42 "), 42);
  assert.equal(parseSeed("4.2"), null);
  assert.equal(parseSeed("-1"), null);
  assert.equal(parseSeed("4294967295"), null);
  assert.equal(nextSeed(7, true, () => 0.5), 7);
  assert.equal(nextSeed(7, false, () => 0.5), 2147483647);
});

test("history thumb: image url, svg markup, short label, nothing", async () => {
  const { thumbKind, thumbSrc } = await import("../../src/vanilla/media.ts");
  assert.equal(thumbKind("data:image/png;base64,AAAA"), "image");
  assert.equal(thumbKind("blob:http://x/1"), "image");
  assert.equal(thumbKind("./runs/3.webp"), "image");
  assert.equal(thumbKind('<svg viewBox="0 0 10 10"><path d="M0 5h10"/></svg>'), "svg");
  assert.equal(thumbKind("0:42"), "label");
  assert.equal(thumbKind("wav"), "label");
  assert.equal(thumbKind(""), "none");
  assert.equal(thumbKind(undefined), "none");
  assert.ok(thumbSrc("<svg></svg>").startsWith("data:image/svg+xml,%3Csvg"));
  assert.equal(thumbSrc("0:42"), "");
  assert.equal(thumbSrc("blob:http://x/1"), "blob:http://x/1");
});
