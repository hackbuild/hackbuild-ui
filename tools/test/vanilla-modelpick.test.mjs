// modelpick: the picker as a pure view. Rows in, choose, load, cancel,
// remove and option out; fixture rows name no real model.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import {
  filterModelRows, groupModelRows, loadLabel, stateWord, canLoad, loadAll, bytesText, ownReady, modelSheet, modelSelect,
} from "../../src/vanilla/modelpick.ts";

const ROWS = [
  { id: "a", name: "fixture small", group: "start", size: "320 mb", bytes: 320e6, backend: "gpu", speed: "fast", verdict: "best all round", state: "stored", detail: [{ label: "licence", value: "fixture licence" }] },
  { id: "b", name: "fixture large", group: "better", size: "4.3 gb", bytes: 4.3e9, backend: "gpu", verdict: "slow, sharp", unfit: "needs 6 gb of gpu memory, this machine has about 2" },
  { id: "c", name: "fixture open", group: "uncensored", size: "1.7 gb", bytes: 1.7e9, backend: "gpu", uncensored: true, noncommercial: true,
    options: [{ key: "quant", label: "quant", value: "q4", choices: [{ value: "q4", label: "q4" }, { value: "q8", label: "q8" }] }] },
  { id: "d", name: "fixture script", group: "none", backend: "browser", verdict: "no download" },
];

test("filters: fits hides unfit rows, uncensored and no download narrow, search matches words", () => {
  assert.deepEqual(filterModelRows(ROWS).map((r) => r.id), ["a", "c", "d"]);
  assert.deepEqual(filterModelRows(ROWS, { fits: false }).map((r) => r.id), ["a", "b", "c", "d"]);
  assert.deepEqual(filterModelRows(ROWS, { uncensored: true }).map((r) => r.id), ["c"]);
  assert.deepEqual(filterModelRows(ROWS, { nodownload: true }).map((r) => r.id), ["d"]);
  assert.deepEqual(filterModelRows(ROWS, { query: "all round" }).map((r) => r.id), ["a"]);
});

test("groups come in sheet order, empty ones left out", () => {
  assert.deepEqual(groupModelRows(ROWS).map((g) => g.label), ["start here", "better", "uncensored", "no download"]);
});

test("words: load label, state word, load all total", () => {
  assert.equal(loadLabel(ROWS[2]), "load, 1.7 gb");
  assert.equal(loadLabel(ROWS[0]), "load");
  assert.equal(loadLabel({ ...ROWS[2], state: "loading", progress: 0.4 }), "loading, 40%");
  assert.equal(loadLabel({ ...ROWS[2], state: "loaded" }), "ready");
  assert.equal(stateWord(ROWS[3]), "built in");
  assert.equal(canLoad(ROWS[1]), false);
  assert.deepEqual(loadAll([ROWS[0], ROWS[2]]), { ids: ["a", "c"], label: "load all, 1.7 gb" });
  assert.equal(bytesText(320e6), "320 mb");
  assert.equal(ownReady("gguf", { repo: "o/n", file: "" }), false);
  assert.equal(ownReady("endpoint", { url: "https://x" }), true);
});

test("sheet: choose a row, its options show, one pink load, detail and remove", () => {
  const d = dom(`<div id="s"></div>`);
  const seen = [];
  const h = modelSheet(d.$("#s"), {
    rows: ROWS,
    onChoose: (id) => seen.push(["choose", id]),
    onLoad: (id) => seen.push(["load", id]),
    onRemove: (id) => seen.push(["remove", id]),
    onOption: (id, k, v) => seen.push(["option", id, k, v]),
  });
  const s = d.$("#s");
  assert.equal(s.querySelectorAll(".hb-mrow").length, 3);
  assert.equal(s.querySelector('[data-pick="b"]'), null, "unfit row hidden while fits is on");
  d.click(s.querySelector('[data-filter="fits"]'));
  assert.ok(s.querySelector(".hb-mrow.is-unfit"));
  d.click(s.querySelector('[data-pick="b"]'));
  assert.equal(h.chosen, "", "an unfit row cannot be chosen");
  d.click(s.querySelector('[data-pick="c"]'));
  assert.equal(h.chosen, "c");
  assert.equal(s.querySelectorAll(".hb-btn-go").length, 1);
  assert.equal(s.querySelector(".hb-btn-go").textContent, "load, 1.7 gb");
  const sel = s.querySelector('select[data-option="quant"]');
  sel.value = "q8";
  sel.dispatchEvent(new d.window.Event("change", { bubbles: true }));
  d.click(s.querySelector("[data-load]"));
  d.click(s.querySelector('[data-more="a"]'));
  assert.ok(s.querySelector('.hb-mrow-detail[data-ux="detail"]'));
  d.click(s.querySelector('[data-remove="a"]'));
  assert.deepEqual(seen, [["choose", "c"], ["option", "c", "quant", "q8"], ["load", "c"], ["remove", "a"]]);
  h.update(ROWS.map((r) => (r.id === "c" ? { ...r, state: "loading", progress: 0.5 } : r)));
  assert.equal(s.querySelectorAll(".hb-btn-go").length, 0, "no pink while loading");
  assert.ok(s.querySelector("[data-cancel]"));
  h.dispose();
  d.close();
});

test("select: the line opens, the pink load shows only when it can act, go off drops it", () => {
  const d = dom(`<div id="m"></div><div id="g"></div>`);
  const seen = [];
  const h = modelSelect(d.$("#m"), { rows: ROWS, chosen: "c", onOpen: () => seen.push("open"), onLoad: (id) => seen.push(id) });
  assert.match(d.$("#m .hb-msel-name").textContent, /fixture open/);
  d.click(d.$("#m .hb-msel-line"));
  d.click(d.$("#m .hb-btn-go"));
  assert.deepEqual(seen, ["open", "c"]);
  h.update(ROWS.map((r) => (r.id === "c" ? { ...r, state: "loaded" } : r)));
  assert.equal(d.$("#m .hb-btn-go"), null);
  assert.equal(d.$("#m .hb-msel-state").textContent, "ready");
  modelSelect(d.$("#g"), { rows: ROWS, chosen: "c", go: false });
  assert.equal(d.$("#g .hb-btn-go"), null);
  h.dispose();
  d.close();
});
