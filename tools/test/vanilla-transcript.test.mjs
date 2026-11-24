// Transcript, level rail and queue strip: rows, search, rail bars, status words.
import { test } from "node:test";
import assert from "node:assert/strict";
import { clockTime, segTime, transcriptRows, markParts, droppedLine, nowIndex, railBars, railTicks, dbText, stripStatus, stripMeta, sizeWord } from "../../src/vanilla/transcript.ts";

const segs = [
  { start: 0, end: 1.8, text: "pixel, sit.", speaker: "mo" },
  { start: 4, end: 6, text: "good. now the red ball." },
];
const dropped = [
  { start: 2, end: 3, text: "thanks for watching", why: "outro" },
  { start: 6.5, end: 7, text: "you", why: "phantom" },
  { start: 8, end: 9, text: "you", why: "phantom" },
];

test("times read as a range, a clock or seconds", () => {
  assert.equal(clockTime(75), "01:15");
  assert.equal(clockTime(3700), "1:01:40");
  assert.equal(clockTime(NaN), "--:--");
  assert.equal(segTime({ start: 1.8, end: 3.6 }), "1.80 to 3.60");
  assert.equal(segTime({ start: 61, end: 62 }, "clock"), "01:01");
  assert.equal(segTime({ start: 1.8, end: 3.6 }, "seconds"), "1.80");
});

test("dropped lines merge in by start time only when shown", () => {
  assert.equal(transcriptRows(segs, dropped).length, 2);
  const rows = transcriptRows(segs, dropped, { showDropped: true });
  assert.deepEqual(rows.map((r) => [r.dropped, r.index, r.why]), [[false, 0, undefined], [true, 0, "outro"], [false, 1, undefined], [true, 1, "phantom"], [true, 2, "phantom"]]);
  assert.equal(droppedLine(dropped), "3 lines dropped: 2 phantom, 1 outro");
  assert.equal(droppedLine([]), "");
});

test("search filters on text or speaker and marks each hit", () => {
  assert.deepEqual(transcriptRows(segs, [], { query: "RED" }).map((r) => r.index), [1]);
  assert.deepEqual(transcriptRows(segs, [], { query: "mo" }).map((r) => r.index), [0]);
  assert.deepEqual(markParts("the red, red ball", "red"), [
    { text: "the ", hit: false }, { text: "red", hit: true }, { text: ", ", hit: false }, { text: "red", hit: true }, { text: " ball", hit: false },
  ]);
  assert.deepEqual(markParts("abc", ""), [{ text: "abc", hit: false }]);
  assert.equal(nowIndex(segs, 4.5), 1);
  assert.equal(nowIndex(segs, 3), -1);
  assert.equal(nowIndex(segs, null), -1);
});

test("rail bars scale to the loudest frame, floor and gate in the same scale", () => {
  const env = [-60, -60, -20, -20, -26, -60];
  const r = railBars({ env, vad: [0, 0, 1, 1, 1, 0], noiseDb: -60, thrDb: -40 }, 3);
  assert.equal(r.samples.length, 3);
  assert.ok(Math.abs(r.samples[0] - 0.01) < 1e-6);
  assert.equal(r.samples[1], 1);
  assert.deepEqual(r.kept, [false, true, true]);
  assert.ok(Math.abs(r.floor - 0.01) < 1e-6);
  assert.ok(Math.abs(r.gate - 0.1) < 1e-6);
  const s = railBars({ env, vad: [[2, 4]], duration: 6 }, 6);
  assert.deepEqual(s.kept, [false, false, true, true, false, false]);
  assert.equal(s.floor, null);
  assert.equal(railBars({ env: [] }).samples.length, 1);
  assert.deepEqual(railTicks(100, 4), ["00:00", "00:25", "00:50", "01:15"]);
  assert.equal(dbText(-52.4), "-52 dB");
  assert.equal(dbText(null), "-");
});

test("strip status takes the job phase, meta marks a low snr", () => {
  assert.deepEqual(stripStatus("running", "working"), { word: "transcribing", tone: "busy" });
  assert.deepEqual(stripStatus("running", "decoding"), { word: "decoding", tone: "busy" });
  assert.deepEqual(stripStatus("done"), { word: "done", tone: "ok" });
  assert.deepEqual(stripStatus("failed"), { word: "failed", tone: "bad" });
  assert.deepEqual(stripStatus("empty").word, "no speech");
  const m = stripMeta({ duration: 75, size: 4.2e6, snrDb: 6.3, density: 0.41, rtf: 12.4, lines: 1 });
  assert.deepEqual(m.map((x) => [x.label ?? "", x.value, x.tone ?? ""]), [
    ["", "01:15", ""], ["", "4 mb", ""], ["snr", "6.3 dB", "lo"], ["speech", "41%", ""], ["", "12.4x rt", ""], ["", "1 line", ""],
  ]);
  assert.equal(stripMeta({ snrDb: 24 })[0].tone, "hi");
});

test("sizeWord never reads 0 mb for a small file", () => {
  assert.equal(sizeWord(320e3), "320 kb");
  assert.equal(sizeWord(12), "1 kb");
  assert.equal(sizeWord(4.2e6), "4 mb");
  assert.equal(sizeWord(2.31e9), "2.3 gb");
  assert.equal(stripMeta({ size: 512e3 })[0].value, "512 kb");
});
