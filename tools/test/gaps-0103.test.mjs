// The gaps the suite rebuild hit (0.10.3): each class has its rule, each
// behaviour its vanilla function, and the Vue parts carry the markup.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dom } from "./dom.mjs";
import { toolSwitch, switchItemsHtml } from "../../src/vanilla/switcher.ts";
import { rackLog, logLines, logTime, LEVEL_WORDS } from "../../src/vanilla/racklog.ts";
import { inspectorHtml, inspectLine, memoryInspector } from "../../src/vanilla/meminspect.ts";
import { wavePeaks, waveTime, waveSel, waveLine, waveDrawer } from "../../src/vanilla/wavedraw.ts";
import { toolRail } from "../../src/vanilla/choice.ts";
import { MASK_TOOLS } from "../../src/vanilla/mask.ts";

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
const css = read("src/styles/hackbuild.css");
const md = read("GUIDELINES.md");
const rule = (sel) => {
  const i = css.indexOf(`${sel}{`);
  assert.ok(i >= 0, `${sel} has no rule`);
  return css.slice(i, css.indexOf("}", i));
};

test("the switcher is hackle's mark: Permanent Marker 26 px and a chevron", () => {
  assert.match(rule(".hb-toolswitch-btn"), /font-family:var\(--hb-display\)/);
  assert.match(rule(".hb-toolswitch-btn"), /font-size:26px/);
  assert.match(rule(".hb-toolswitch-btn::after"), /rotate\(45deg\)/);
  assert.match(rule(".hb-header .hb-toolswitch-btn > .hb-toolswitch-name"), /text-overflow:ellipsis/);
  assert.match(rule(".hb-lay > .hb-lay-body"), /grid-row:2/);
  assert.match(rule('.hb-toolswitch-item[aria-current="true"]'), /background:var\(--hb-ink\)/);
  const header = read("src/components/HbHeader.vue");
  assert.match(header, /class="hb-toolswitch hb-menu-wrap"/);
  assert.match(header, /<slot name="tool">/);
  assert.match(header, /switch: \[id: string\]/);
});

test("toolSwitch opens a menu, marks the tool on screen and picks another", () => {
  const tools = [{ id: "yard", label: "yard" }, { id: "chat", label: "chat", note: "talk" }];
  const d = dom(`<div class="hb-toolswitch hb-menu-wrap"><h1><button class="hb-toolswitch-btn">yard</button></h1><div class="hb-menu">${switchItemsHtml(tools, "yard")}</div></div>`);
  const picked = [];
  const h = toolSwitch(d.$(".hb-toolswitch"), { current: "yard", onPick: (id) => picked.push(id) });
  assert.equal(d.$(".hb-toolswitch-btn").getAttribute("aria-haspopup"), "menu");
  d.click(d.$(".hb-toolswitch-btn"));
  assert.ok(h.isOpen);
  assert.ok(d.$(".hb-toolswitch").classList.contains("is-open"));
  assert.equal(d.$('[data-value="yard"]').getAttribute("aria-current"), "true");
  d.click(d.$('[data-value="yard"]'));
  assert.deepEqual(picked, []);
  h.open();
  d.click(d.$('[data-value="chat"]'));
  assert.deepEqual(picked, ["chat"]);
  assert.equal(h.current, "chat");
  assert.equal(d.$('[data-value="yard"]').hasAttribute("aria-current"), false);
  assert.match(switchItemsHtml([{ id: "a", label: "<a>", href: "#/a" }]), /^<a class="hb-menu-item hb-toolswitch-item" href="#\/a"/);
  h.dispose();
  d.close();
});

test("a layout fills the viewport under an app bar", () => {
  assert.match(rule(".hb-header + .hb-lay"), /calc\(100dvh - 52px - env\(safe-area-inset-top\)\)/);
  assert.match(rule(".hb-barpage"), /grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(rule(".hb-barpage > .hb-lay,.hb-barpage > .hb-header + .hb-lay,.hb-barpage > .hb-view > .hb-lay"), /height:auto; min-height:0/);
  assert.match(read("src/components/HbBarPage.vue"), /class="hb-barpage"/);
  // every layout demo sits under the bar and keeps its markers
  for (const f of ["StageRack", "CanvasRail", "DropFirst", "Conversation", "Gate", "FormFrame"]) {
    const s = read(`site/src/pages/layouts/${f}Demo.vue`);
    assert.match(s, /<HbBarPage>\n    <template #bar>/, f);
    assert.equal((s.match(/<template #bar/g) ?? []).length, 1, f);
  }
  assert.match(read("src/components/HbHeader.vue"), /data-ux="bar"/);
});

test("the memory inspector fits a 380 px rack: two lines a row, parts in a fold", () => {
  const rec = { query: "where", mode: "hybrid", rows: [{ rank: 1, kind: "fact", text: "a <b>", score: "0.8", used: true, parts: { bm25: "#1 2.0" } }, { rank: 2, kind: "event", text: "b", score: "0.2", used: false }] };
  assert.equal(inspectLine(rec), '"where", hybrid, 2 found, 1 used.');
  const html = inspectorHtml(rec);
  assert.doesNotMatch(html, /<table/);
  assert.match(html, /a &lt;b&gt;/);
  assert.match(html, /<details class="hb-meminspect-parts" data-ux="detail">/);
  assert.match(inspectorHtml(null), /no recall yet/);
  const d = dom(`<div id="h"></div>`);
  const m = memoryInspector(d.$("#h"), rec);
  assert.equal(d.document.querySelectorAll(".hb-meminspect-row").length, 2);
  assert.ok(d.$("#h").classList.contains("hb-meminspect"));
  m.set(null);
  assert.ok(d.$(".hb-meminspect-empty"));
  d.close();
  assert.match(rule(".hb-meminspect-text"), /overflow-wrap:anywhere/);
  assert.match(rule(".hb-meminspect-kind"), /text-overflow:ellipsis/);
  assert.match(read("src/components/HbMemoryInspector.vue"), /class="hb-meminspect"/);
});

test("code reads on paper", () => {
  assert.match(rule(".hb-codeblock.is-paper pre"), /background:var\(--hb-paper-raised\); color:var\(--hb-ink\)/);
  assert.match(rule(".hb pre.hb-code,pre.hb-code"), /background:var\(--hb-paper-raised\); color:var\(--hb-ink\)/);
  assert.match(read("src/components/HbCodeBlock.vue"), /'is-paper': props.paper/);
});

test("the rack log: time, line, level; follows the foot and trims", () => {
  assert.equal(logTime("10:02:11"), "10:02:11");
  assert.match(logTime(Date.UTC(2026, 0, 1, 12, 3, 4)), /^\d\d:03:04$/);
  assert.equal(LEVEL_WORDS.error, "err");
  const lines = [{ t: "1", line: "a" }, { t: "2", line: "b", level: "warn" }, { t: "3", line: "c", level: "error" }];
  assert.deepEqual(logLines(lines, { min: "warn" }).map((l) => l.line), ["b", "c"]);
  assert.deepEqual(logLines(lines, { max: 2 }).map((l) => l.line), ["b", "c"]);
  const d = dom(`<ol class="hb-racklog" data-empty="nothing yet."></ol>`);
  const h = rackLog(d.$(".hb-racklog"), { max: 2 });
  assert.equal(d.$(".hb-racklog").getAttribute("role"), "log");
  assert.ok(d.$(".hb-racklog").classList.contains("is-empty"));
  for (const l of lines) h.add(l);
  assert.equal(h.count, 2);
  const row = d.$(".hb-racklog-row:last-child");
  assert.ok(row.classList.contains("is-error"));
  assert.deepEqual([...row.children].map((c) => c.className), ["hb-racklog-t", "hb-racklog-line", "hb-racklog-level"]);
  assert.equal(row.querySelector(".hb-racklog-level").textContent, "err");
  h.clear();
  assert.ok(d.$(".hb-racklog").classList.contains("is-empty"));
  d.close();
  assert.match(rule(".hb-racklog-row"), /grid-template-columns:auto minmax\(0,1fr\) auto/);
  assert.match(rule(".hb-racklog.is-empty::before"), /content:attr\(data-empty\)/);
});

test("the waveform drawer: peaks, times, a span and keys", () => {
  assert.deepEqual(wavePeaks([0, 0.5, -0.5, 1], 2), [[0, 0.5], [-0.5, 1]]);
  assert.equal(waveTime(65.27), "1:05.3");
  assert.equal(waveTime(1.2), "0:01.2");
  assert.equal(waveTime(59.96), "1:00.0");
  assert.deepEqual(waveSel(3, 1, 2), { start: 1, end: 2 });
  assert.equal(waveSel(1, 1, 4), null);
  assert.equal(waveLine(1, 4, { start: 1, end: 2 }), "0:01.0 / 0:04.0, picked 0:01.0 to 0:02.0");
  const d = dom(`<section class="hb-wavedraw"><div class="hb-wavedraw-head"><button class="hb-wavedraw-toggle">clip</button><span class="hb-wavedraw-time"></span></div><div class="hb-wavedraw-body"><canvas class="hb-wavedraw-canvas"></canvas></div></section>`);
  const seen = [];
  const h = waveDrawer(d.$(".hb-wavedraw"), { samples: [0, 1, -1, 0], duration: 10, at: 5, onSeek: (t) => seen.push(t), onSelect: (s) => seen.push(s) });
  const c = d.$("canvas");
  assert.equal(c.getAttribute("role"), "slider");
  assert.equal(d.$(".hb-wavedraw-time").textContent, "0:05.0 / 0:10.0");
  d.key(c, "ArrowRight");
  assert.equal(h.at, 5.1);
  d.key(c, "ArrowRight", { shiftKey: true });
  assert.deepEqual(h.sel, { start: 5.1, end: 5.199999999999999 });
  d.key(c, "Escape");
  assert.equal(h.sel, null);
  d.key(c, "End");
  assert.equal(h.at, 10);
  d.click(d.$(".hb-wavedraw-toggle"));
  assert.equal(h.isOpen, false);
  assert.equal(d.$(".hb-wavedraw-body").hidden, true);
  assert.equal(d.$(".hb-wavedraw-toggle").getAttribute("aria-expanded"), "false");
  h.dispose();
  d.close();
  assert.match(rule(".hb-lay-subject > .hb-wavedraw"), /position:absolute/);
});

test("a pressed button is ink, as hackle's .btn.on", () => {
  assert.match(rule('.hb-btn[aria-pressed="true"]'), /background:var\(--hb-ink\); color:var\(--hb-paper\)/);
});

test("form and frame contains its media", () => {
  const r = rule(".hb-lay.is-form-frame .hb-lay-subject > :is(img, video, canvas, svg, picture),.hb-lay-media");
  assert.match(r, /object-fit:contain/);
  assert.match(r, /height:calc\(100% - 2 \* var\(--hb-s3\)\)/);
  assert.match(read("site/src/pages/layouts/FormFrameDemo.vue"), /<img v-else :src="sample"/);
});

test("the mask rail shows six places; the shapes share one", () => {
  const places = new Set(MASK_TOOLS.map((t) => t.group ?? t.id));
  assert.equal(places.size, 6);
  assert.deepEqual(MASK_TOOLS.filter((t) => t.group === "shape").map((t) => t.id), ["lasso", "polygon", "rect", "ellipse"]);
  assert.match(read("src/components/HbMaskEditor.vue"), /group: t.group/);
});

test("toolRail groups: one shown, the menu picks, letters pick any", () => {
  const d = dom(`<div class="hb-toolrail" aria-orientation="vertical">
    <button data-tool="wand" data-key="w">w</button>
    <div class="hb-railgroup"><button data-tool="lasso" data-key="l">l</button><button data-tool="rect" data-key="m">m</button>
      <div class="hb-railgroup-menu"><button data-pick="lasso">lasso</button><button data-pick="rect">rect</button></div></div>
    <button data-tool="pan" data-key="h">h</button></div><p id="out">x</p>`);
  const seen = [];
  const h = toolRail(d.$(".hb-toolrail"), { value: "wand", onChange: (id) => seen.push(id) });
  const lasso = d.$('[data-tool="lasso"]');
  const rect = d.$('[data-tool="rect"]');
  const menuEl = d.$(".hb-railgroup-menu");
  assert.equal(lasso.hidden, false);
  assert.equal(rect.hidden, true);
  assert.equal(menuEl.hidden, true);
  assert.equal(lasso.getAttribute("aria-haspopup"), "menu");
  // first press picks the shown tool, the second opens the group
  d.click(lasso);
  assert.equal(h.value, "lasso");
  assert.equal(menuEl.hidden, true);
  d.click(lasso);
  assert.equal(menuEl.hidden, false);
  assert.equal(lasso.getAttribute("aria-expanded"), "true");
  assert.equal(d.$('[data-pick="lasso"]').getAttribute("role"), "menuitemradio");
  d.click(d.$('[data-pick="rect"]'));
  assert.equal(h.value, "rect");
  assert.equal(menuEl.hidden, true);
  assert.equal(rect.hidden, false);
  assert.equal(lasso.hidden, true);
  // the group keeps showing rect after another tool is picked
  h.set("pan");
  assert.equal(rect.hidden, false);
  // arrows skip the hidden members; right opens the group
  d.key(d.$('[data-tool="wand"]'), "ArrowDown");
  assert.equal(h.value, "rect");
  d.key(rect, "ArrowRight");
  assert.equal(menuEl.hidden, false);
  d.key(d.document.activeElement, "Escape");
  assert.equal(menuEl.hidden, true);
  assert.equal(d.document.activeElement, rect);
  d.click(rect);
  d.pointerdown(d.$("#out"));
  assert.equal(menuEl.hidden, true);
  assert.deepEqual(seen, ["lasso", "rect", "rect"]);
  h.dispose();
  d.close();
  assert.match(rule(".hb-railgroup > .hb-toolrail-btn::after"), /border-top:6px solid currentColor/);
  assert.match(rule(".hb-railgroup-menu"), /position:fixed/);
  const rail = read("src/components/HbToolRail.vue");
  assert.match(rail, /class="hb-railgroup"/);
  assert.match(rail, /:data-pick="t.id"/);
});

test("every new class and part has its GUIDELINES row", () => {
  for (const c of [".hb-toolswitch", ".hb-barpage", ".hb-meminspect", ".hb-codeblock.is-paper", "pre.hb-code", ".hb-racklog", ".hb-wavedraw", '.hb-btn[aria-pressed="true"]', ".hb-lay-media", ".hb-railgroup"]) assert.ok(md.includes("`" + c), c);
  for (const p of ["HbBarPage", "HbRackLog", "HbMemoryInspector", "HbWaveDrawer", "toolSwitch", "rackLog", "memoryInspector", "waveDrawer"]) assert.ok(md.includes("`" + p), p);
});
