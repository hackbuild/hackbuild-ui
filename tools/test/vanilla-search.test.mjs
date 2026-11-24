// searchList: filter by words, hide empty groups, arrows, Enter, Escape.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { searchList, matchesQuery } from "../../src/vanilla/search.ts";
import { activity, activityLine, summarize, percentText } from "../../src/vanilla/activity.ts";

const HTML = `<input id="q"><div id="l">
<div role="group" id="g1"><span>image</span><button role="option" data-key="vision" data-search="image vision camera">vision</button><button role="option" data-key="seg" data-search="image segmentation">segmentation</button></div>
<div role="group" id="g2"><span>voice</span><button role="option" data-key="stt" data-search="voice transcription">transcription</button></div>
</div><p id="e" hidden>nothing matches that.</p>`;

test("matchesQuery needs every word, any case", () => {
  assert.equal(matchesQuery("Img vis", "image vision"), false);
  assert.equal(matchesQuery("image VIS", "image vision"), true);
  assert.equal(matchesQuery("", "anything"), true);
});

test("typing filters items and groups, arrows wrap, Enter picks, Escape clears", () => {
  const d = dom(HTML);
  const picked = [];
  const q = d.$("#q");
  const h = searchList(q, d.$("#l"), { empty: d.$("#e"), onPick: (i) => picked.push(i.dataset.key) });
  assert.equal(q.getAttribute("role"), "combobox");
  assert.equal(h.active.dataset.key, "vision");
  q.value = "voice";
  q.dispatchEvent(new d.window.Event("input"));
  assert.equal(d.$("#g1").hidden, true);
  assert.equal(d.$("#g2").hidden, false);
  assert.equal(h.active.dataset.key, "stt");
  assert.equal(q.getAttribute("aria-activedescendant"), h.active.id);
  d.key(q, "Enter");
  assert.deepEqual(picked, ["stt"]);
  q.value = "zzz";
  q.dispatchEvent(new d.window.Event("input"));
  assert.equal(d.$("#e").hidden, false);
  assert.equal(h.active, null);
  const esc = d.key(q, "Escape");
  assert.equal(esc.defaultPrevented, true, "a query is cleared before Escape reaches an overlay");
  assert.equal(q.value, "");
  assert.equal(d.$("#e").hidden, true);
  d.key(q, "ArrowUp");
  assert.equal(h.active.dataset.key, "stt", "up from the first wraps to the last");
  d.key(q, "ArrowDown");
  assert.equal(h.active.dataset.key, "vision");
  assert.equal(d.key(q, "Escape").defaultPrevented, false, "empty field passes Escape on");
  d.click(d.$('[data-key="seg"]'));
  assert.deepEqual(picked, ["stt", "seg"]);
  h.dispose();
  d.close();
});

test("summarize and activityLine draw the oldest task", () => {
  let t = 0;
  const store = activity({ now: () => ++t });
  assert.equal(percentText(null), "");
  assert.equal(percentText(0.426), " 43%");
  const d = dom(`<div class="hb-activity"><span class="hb-activity-label"></span><span class="hb-activity-more"></span><span class="hb-activity-line"><span class="hb-activity-fill"></span></span></div>`);
  const el = d.$(".hb-activity");
  const h = activityLine(el, store);
  assert.equal(el.hidden, true);
  store.set("a", "loading", 0.5);
  store.set("b", "indexing");
  assert.equal(el.hidden, false);
  assert.equal(d.$(".hb-activity-label").textContent, "loading 50%");
  assert.equal(d.$(".hb-activity-more").textContent, "+1");
  assert.equal(d.$(".hb-activity-fill").style.width, "50%");
  assert.equal(el.classList.contains("is-known"), true);
  store.fail("a", "out of memory");
  assert.equal(d.$(".hb-activity-label").textContent, "loading failed");
  assert.equal(summarize(store.list()).detail, "loading: out of memory\nindexing");
  store.end("a");
  store.end("b");
  assert.equal(el.hidden, true);
  h.dispose();
  d.close();
});
