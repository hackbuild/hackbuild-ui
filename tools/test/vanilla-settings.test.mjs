// The settings schema helpers, matchPreset and rangeRow.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { shownAt, defaultsOf, changedKeys, resetValues, sectionsOf, matchPreset, rangeRow } from "../../src/vanilla/settings.ts";

const schema = [
  { key: "temp", type: "range", label: "temperature", why: "lower is steadier", default: 0.7, section: "brain" },
  { key: "topP", type: "range", label: "top p", why: "nucleus cutoff", default: 0.9, section: "brain", level: "expert" },
  { key: "rate", type: "range", label: "rate", why: "speech speed", default: 1, section: "voice", level: "standard" },
  { key: "hints", type: "switch", label: "key hints", why: "print the keys", default: true, section: "suite" },
];

test("levels hide rows above the current one", () => {
  assert.deepEqual(schema.filter((d) => shownAt(d, "guided")).map((d) => d.key), ["temp", "hints"]);
  assert.deepEqual(schema.filter((d) => shownAt(d, "standard")).map((d) => d.key), ["temp", "rate", "hints"]);
  assert.equal(schema.filter((d) => shownAt(d, "expert")).length, 4);
});

test("defaults, changes and resets by section", () => {
  const v = { ...defaultsOf(schema), temp: 0.2, rate: 1.4 };
  assert.deepEqual(changedKeys(v, schema), ["temp", "rate"]);
  const r = resetValues(v, schema.filter((d) => d.section === "brain"));
  assert.equal(r.temp, 0.7);
  assert.equal(r.rate, 1.4, "other sections keep their values");
  assert.deepEqual(changedKeys(resetValues(v, schema), schema), []);
  assert.deepEqual(defaultsOf(schema, "voice"), { rate: 1 });
});

test("sections follow the given order, then the rest", () => {
  assert.deepEqual(sectionsOf(schema, ["suite", "brain"]).map((s) => s.key), ["suite", "brain", "voice"]);
  assert.deepEqual(sectionsOf(schema, ["missing"]).map((s) => s.key), ["brain", "voice", "suite"]);
});

test("a preset is on only while every value it names holds", () => {
  const presets = [
    { label: "precise", values: { temp: 0.2, topP: 0.8 } },
    { label: "balanced", values: { temp: 0.7, topP: 0.9 } },
  ];
  assert.equal(matchPreset(presets, { temp: 0.7, topP: 0.9, rate: 2 }), 1);
  assert.equal(matchPreset(presets, { temp: 0.71, topP: 0.9 }), -1);
});

test("range row: drag previews, release commits, numbers clamp to the step", () => {
  const d = dom(`<div id="r"><input type="range" min="0" max="2" step="0.05" value="0.7"><input type="number"></div>`);
  const seen = [];
  const h = rangeRow(d.$("#r"), { onPreview: (v) => seen.push(["p", v]), onCommit: (v) => seen.push(["c", v]) });
  const [range, num] = d.document.querySelectorAll("input");
  range.value = "1.2";
  range.dispatchEvent(new d.window.Event("input", { bubbles: true }));
  assert.equal(num.value, "1.2", "the number follows the drag");
  range.dispatchEvent(new d.window.Event("change", { bubbles: true }));
  num.value = "9";
  num.dispatchEvent(new d.window.Event("change", { bubbles: true }));
  assert.equal(range.value, "2");
  num.value = "0.333";
  num.dispatchEvent(new d.window.Event("change", { bubbles: true }));
  assert.equal(h.value, 0.35);
  num.value = "abc";
  num.dispatchEvent(new d.window.Event("change", { bubbles: true }));
  assert.equal(num.value, "0.35", "a bad number goes back");
  assert.deepEqual(seen, [["p", 1.2], ["c", 1.2], ["c", 2], ["c", 0.35]]);
  h.dispose();
  d.close();
});
