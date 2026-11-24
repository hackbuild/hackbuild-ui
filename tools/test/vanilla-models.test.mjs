// Model catalogue words, grouping, filters, load text and the picker keys.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { sizeText, vramText, factLine, licenceText, groupRecords, filterRecords, ctxOptions, sumFiles, loadText, modelList } from "../../src/vanilla/models.ts";

const recs = [
  { id: "a", group: "start here", sizeMB: 1733, sizeSource: "measured", censorship: "uncensored", vramMB: 2200, vramSource: "vendor", params: "3B", quant: "q4f16_1", ctx: 4096 },
  { id: "b", group: "start here", sizeMB: 370, sizeSource: "measured", censorship: "stock" },
  { id: "c", group: "no download", sizeMB: null, sizeSource: "unknown" },
  { id: "d", group: "tiny", sizeMB: 174, sizeSource: "inferred", censorship: "abliterated", tags: ["no gpu"] },
];

test("sizes keep their source word; unknown says so", () => {
  assert.equal(sizeText(1733, "measured"), "1.7 GB (measured)");
  assert.equal(sizeText(9.5, "vendor"), "9.5 MB (vendor)");
  assert.equal(sizeText(null), "size unknown");
  assert.equal(vramText(recs[0]), "vram 2.1 GB (vendor)");
  assert.equal(factLine(recs[0]), "3B, q4f16_1, vram 2.1 GB (vendor), context up to 4k");
});

test("licence is optional and names only a refusal of commercial use", () => {
  assert.equal(licenceText(""), "");
  assert.equal(licenceText("Apache-2.0", true), "licence as recorded: Apache-2.0");
  assert.equal(licenceText("CC-BY-NC-4.0", false), "licence as recorded: CC-BY-NC-4.0, no commercial use");
});

test("groups follow the order given, rows by size, unknown last", () => {
  const g = groupRecords(recs, ["no download", "start here"]);
  assert.deepEqual(g.map((x) => x.group), ["no download", "start here", "tiny"]);
  assert.deepEqual(g[1].rows.map((r) => r.id), ["b", "a"]);
});

test("filters by words, censorship and fit", () => {
  assert.deepEqual(filterRecords(recs, { query: "no gpu" }).map((r) => r.id), ["d"]);
  assert.deepEqual(filterRecords(recs, { censorship: ["", "abliterated", "uncensored"] }).map((r) => r.id), ["a", "d"]);
  const fits = { a: { fit: "over memory", ok: false, reason: "" } };
  assert.deepEqual(filterRecords(recs, { fitsOnly: true }, fits).map((r) => r.id), ["b", "c", "d"]);
});

test("context sizes over the build limit stay listed and disabled", () => {
  const o = ctxOptions(4096, [2048, 4096, 8192]);
  assert.deepEqual(o.map((x) => x.disabled), [false, false, true]);
  assert.equal(o[2].label, "8k");
});

test("load text sums files, hides the total until every file states one, names the phase", () => {
  const MB = 1024 * 1024;
  const files = [{ name: "a", loaded: 10 * MB, total: 10 * MB }, { name: "b", loaded: 2 * MB, total: 20 * MB }];
  assert.deepEqual(sumFiles(files), { loaded: 12 * MB, total: 30 * MB, done: 1 });
  assert.equal(loadText({ files }), "downloading 1 of 2 files, 12 of 30 MB");
  assert.equal(sumFiles([...files, { name: "c", loaded: 0, total: null }]).total, null);
  assert.equal(loadText({ loaded: 0.2 * MB, total: null }), "downloading 0.2 MB, total unknown");
  assert.equal(loadText({ phase: "compile" }), "compiling");
  assert.equal(loadText({ phase: "error", error: "network dropped." }), "failed. network dropped.");
});

const HTML = `<input id="q"><div id="l">
<section data-group id="g1"><ul>
<li data-row><button data-model="a" data-search="hermes uncensored">a</button><button data-act id="aa">download</button></li>
<li data-row><button data-model="b" data-search="qwen stock" aria-disabled="true">b</button><button data-act id="ba">download</button></li>
<li data-row><button data-model="c" data-search="smol stock">c</button><button data-act id="ca">load</button></li>
</ul></section></div><p id="e" hidden>none</p>`;

test("picker: one radio and its actions in the tab order, arrows skip disabled rows, search hides groups", () => {
  const d = dom(HTML);
  const changes = [];
  const h = modelList(d.$("#l"), { value: "a", search: d.$("#q"), empty: d.$("#e"), onChange: (id) => changes.push(id) });
  const a = d.$('[data-model="a"]');
  assert.equal(d.$("#l").getAttribute("role"), "radiogroup");
  assert.equal(a.getAttribute("aria-checked"), "true");
  assert.equal(a.tabIndex, 0);
  assert.equal(d.$("#aa").tabIndex, 0);
  assert.equal(d.$("#ca").tabIndex, -1);
  d.key(a, "ArrowDown");
  assert.deepEqual(changes, ["c"], "the disabled row is skipped");
  assert.equal(d.$("#ca").tabIndex, 0);
  d.click(d.$('[data-model="b"]'));
  assert.equal(h.value, "c", "a disabled row cannot be checked");
  d.key(d.$('[data-model="c"]'), "ArrowDown");
  assert.equal(h.value, "a", "wraps");
  const q = d.$("#q");
  q.value = "zzz";
  q.dispatchEvent(new d.window.Event("input"));
  assert.equal(d.$("#g1").hidden, true);
  assert.equal(d.$("#e").hidden, false);
  q.value = "smol";
  q.dispatchEvent(new d.window.Event("input"));
  assert.equal(d.$("#g1").hidden, false);
  assert.equal(d.$('[data-model="c"]').tabIndex, 0, "the first row that shows takes the stop when the checked one is hidden");
  const e = d.key(q, "ArrowDown");
  assert.equal(e.defaultPrevented, true);
  h.dispose();
  d.close();
});
