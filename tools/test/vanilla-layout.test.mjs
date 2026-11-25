// layout: the six page layouts over the class layer. Markers for the
// screen gate, the rack tabs, and each kind's own behaviour.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { layout, stageRack, canvasRail, dropFirst, conversation, gate, formFrame, gateCheckView } from "../../src/vanilla/layout.ts";

const RACK = `<aside class="hb-rack"><nav class="hb-tabs"><button role="tab" data-value="mind">mind</button><button role="tab" data-value="body">body</button><button role="tab" data-value="log">log</button></nav>
<section class="hb-rack-pane">m</section><section class="hb-rack-pane">b</section><section class="hb-rack-pane">l</section>
<details class="hb-rack-detail"><summary>detail</summary><div>x</div></details></aside>`;
const page = (kind, stage, extra = "") => `<div id="r" class="hb-lay is-${kind}"><div class="hb-lay-bar"><header>bar</header></div><div class="hb-lay-body">${extra}<section class="hb-lay-stage">${stage}</section>${kind === "gate" ? "" : RACK}</div></div>`;

test("stage and rack: every marker set, the first tab live, tabs switch panes", () => {
  const d = dom(page("stage-rack", `<div class="hb-lay-subject"></div><div class="hb-lay-inset"></div><div class="hb-lay-verbs"><button>throw</button></div>`));
  const seen = [];
  const h = stageRack(d.$("#r"), { onTab: (id) => seen.push(id) });
  for (const ux of ["bar", "subject", "rack", "verbs", "inset", "detail"]) assert.ok(d.$(`[data-ux~="${ux}"]`), ux);
  assert.equal(d.$("#r").dataset.layout, "stage-rack");
  const panes = [...d.document.querySelectorAll(".hb-rack-pane")];
  assert.deepEqual(panes.map((p) => p.hidden), [false, true, true]);
  h.rack.select("body");
  assert.deepEqual(panes.map((p) => p.hidden), [true, false, true]);
  assert.deepEqual(seen, ["body"]);
  h.dispose();
  d.close();
});

test("kind comes from the class when not given; markers are not doubled", () => {
  const d = dom(page("form-frame", `<div class="hb-lay-subject" data-ux="subject"></div>`));
  const h = layout(d.$("#r"));
  assert.equal(h.kind, "form-frame");
  assert.equal(d.$(".hb-lay-subject").dataset.ux, "subject");
  h.dispose();
  formFrame(d.$("#r")).dispose();
  d.close();
});

test("canvas and rail: one tool pressed at a time", () => {
  const d = dom(page("canvas-rail", `<div class="hb-lay-subject"></div>`, `<nav class="hb-lay-tools"><button data-tool="wand">w</button><button data-tool="brush">b</button></nav>`));
  const seen = [];
  const h = canvasRail(d.$("#r"), { onTool: (t) => seen.push(t) });
  const [w, b] = d.document.querySelectorAll("[data-tool]");
  assert.equal(w.getAttribute("aria-pressed"), "true");
  d.click(b);
  assert.deepEqual([w.getAttribute("aria-pressed"), b.getAttribute("aria-pressed")], ["false", "true"]);
  assert.deepEqual(seen, ["brush"]);
  h.dispose();
  d.close();
});

test("drop first: the pick button opens the file input; a drop marks the zone hot then clear", () => {
  const d = dom(page("drop-first", `<div class="hb-lay-subject"><div class="hb-lay-drop"><button data-pick>choose a file</button></div><input type="file" hidden></div><div class="hb-lay-verbs"><button data-add>add files</button></div>`));
  let picked = 0;
  d.$('input[type="file"]').click = () => { picked++; };
  const h = dropFirst(d.$("#r"), { onFiles: () => {} });
  d.click(d.$("[data-pick]"));
  d.click(d.$("[data-add]"));
  assert.equal(picked, 2, "pick and add files both open the input");
  d.$(".hb-lay-subject").dispatchEvent(new d.window.Event("dragover", { bubbles: true, cancelable: true }));
  assert.ok(d.$(".hb-lay-drop").classList.contains("is-hot"));
  d.$(".hb-lay-subject").dispatchEvent(new d.window.Event("dragleave", { bubbles: true }));
  assert.ok(!d.$(".hb-lay-drop").classList.contains("is-hot"));
  h.dispose();
  d.close();
});

test("conversation: Enter sends and clears, Shift Enter does not, empty text is not sent", () => {
  const d = dom(page("conversation", `<div class="hb-lay-subject"></div><form class="hb-lay-composer"><textarea></textarea><button type="submit">send</button></form>`));
  const sent = [];
  const h = conversation(d.$("#r"), { onSend: (t) => sent.push(t) });
  const area = d.$("textarea");
  area.value = "hi there";
  d.key(area, "Enter", { shiftKey: true });
  d.key(area, "Enter");
  d.key(area, "Enter");
  assert.deepEqual(sent, ["hi there"]);
  assert.equal(area.value, "");
  h.dispose();
  d.close();
});

test("gate: the pink button goes, not while busy; a gate has no rack", () => {
  const d = dom(page("gate", `<div class="hb-lay-subject"></div><div class="hb-gate-wrap"><section class="hb-gate-card"><button class="hb-btn hb-btn-go hb-gate-go">wake</button></section></div>`));
  let n = 0;
  const h = gate(d.$("#r"), { onGo: () => n++ });
  assert.equal(h.rack, null);
  d.click(d.$(".hb-gate-go"));
  d.$(".hb-gate-go").setAttribute("aria-busy", "true");
  d.click(d.$(".hb-gate-go"));
  assert.equal(n, 1);
  h.dispose();
  d.click(d.$(".hb-gate-go"));
  assert.equal(n, 1, "dispose removes the listener");
  d.close();
});

test("gate check: fill and words per state; a note wins", () => {
  assert.deepEqual(gateCheckView("wait"), { pct: 0, words: "waiting" });
  assert.deepEqual(gateCheckView("load", 0.42), { pct: 42, words: "42%" });
  assert.deepEqual(gateCheckView("ok", 0.1), { pct: 100, words: "ready" });
  assert.deepEqual(gateCheckView("err", 0.3, "no gpu memory"), { pct: 30, words: "no gpu memory" });
});
