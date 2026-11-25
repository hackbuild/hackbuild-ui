// eventLog, codeBlock, exportName and withExt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { eventLog } from "../../src/vanilla/log.ts";
import { codeBlock, codeSpans } from "../../src/vanilla/code.ts";
import { exportName, withExt } from "../../src/vanilla/save.ts";

test("event log: tags, cap, live rows replaced in place, hide by kind", () => {
  const d = dom(`<div id="l"><div class="hb-evlog-rows"></div></div>`);
  const h = eventLog(d.$("#l"), { max: 3 });
  h.push("you", "come here");
  h.push("me", "on my way");
  const bar = h.live("brain", "brain 10 of 400 mb", 0.025);
  assert.equal(bar.querySelector(".hb-evlog-bar > i").style.width, "3%");
  h.live("brain", "brain 200 of 400 mb", 0.5);
  assert.equal(d.document.querySelectorAll(".is-live").length, 1, "one live row per key");
  h.push("fail", "path blocked", "14:02:11");
  h.push("act", "sat down");
  const rows = [...d.document.querySelectorAll(".hb-evlog-row")];
  assert.deepEqual(rows.map((r) => r.querySelector(".hb-evlog-tag").textContent), ["me", "fail", "act", "load"]);
  assert.ok(rows[1].classList.contains("is-err"));
  assert.equal(rows[1].querySelector(".hb-evlog-t").textContent, "14:02:11");
  assert.equal(rows.at(-1).classList.contains("is-live"), true, "live rows stay at the foot");
  h.hide(["act"]);
  assert.equal(rows[2].hidden, true);
  h.live("brain", null);
  assert.equal(d.document.querySelectorAll(".is-live").length, 0);
  h.dispose();
  d.close();
});

test("event log: follow turns off and on, and reports it", () => {
  const d = dom(`<div id="l"></div>`);
  const seen = [];
  const h = eventLog(d.$("#l"), { onFollow: (on) => seen.push(on) });
  assert.equal(h.following, true);
  h.follow(false);
  h.follow(true);
  assert.deepEqual(seen, [false, true]);
  h.dispose();
  d.close();
});

test("code block: wrap toggles, copy says copied then failed", async () => {
  const d = dom(`<div id="c"><button data-wrap></button><button data-copy><span data-label>copy</span></button><pre><code>npm i x</code></pre></div>`);
  const got = [];
  let ok = true;
  const h = codeBlock(d.$("#c"), { clipboard: { writeText: async (t) => { if (!ok) throw new Error("no"); got.push(t); } }, doc: d.document });
  assert.equal(d.$("pre").tabIndex, 0);
  d.click(d.$("[data-wrap]"));
  assert.equal(d.$("#c").classList.contains("is-wrap"), true);
  assert.equal(d.$("[data-wrap]").getAttribute("aria-pressed"), "true");
  assert.equal(await h.copy(), true);
  assert.deepEqual(got, ["npm i x"]);
  assert.equal(d.$("[data-label]").textContent, "copied");
  ok = false;
  assert.equal(await h.copy(), false);
  assert.equal(d.$("[data-label]").textContent, "copy failed");
  h.dispose();
  d.close();
});

test("export names carry the run and take one extension", () => {
  const at = new Date(2026, 10, 24, 1, 3, 44);
  assert.equal(exportName(["grommet", "SD Turbo", 42, null, ""], { at }), "grommet_sd-turbo_42_20261124-010344");
  assert.equal(exportName([], { stamp: false }), "export");
  assert.equal(withExt("take 1", "srt"), "take 1.srt");
  assert.equal(withExt("take 1.SRT", ".srt"), "take 1.SRT");
  assert.equal(withExt("a/b:c", ".json"), "a-b-c.json");
  assert.equal(withExt("  ", ".txt"), "export.txt");
});

test("codeSpans splits prose on backticks and keeps an unclosed one", () => {
  assert.deepEqual(codeSpans("call `reply()` then `stop()`."), [
    { code: false, text: "call " }, { code: true, text: "reply()" }, { code: false, text: " then " }, { code: true, text: "stop()" }, { code: false, text: "." },
  ]);
  assert.deepEqual(codeSpans("no code here"), [{ code: false, text: "no code here" }]);
  assert.deepEqual(codeSpans("a ` lone tick"), [{ code: false, text: "a ` lone tick" }]);
  assert.deepEqual(codeSpans("``"), [{ code: false, text: "``" }]);
});

test("replaceRow swaps a live row in place, adds a new one at the end, removes on null", async () => {
  const { replaceRow, EVENT_KINDS } = await import("../../src/vanilla/log.ts");
  const rows = [{ id: 1, text: "a" }, { id: "dl", text: "10" }, { id: 2, text: "b" }];
  assert.deepEqual(replaceRow(rows, "dl", { id: "dl", text: "50" }).map((r) => r.text), ["a", "50", "b"]);
  assert.deepEqual(replaceRow(rows, 3, { id: 3, text: "c" }).map((r) => r.id), [1, "dl", 2, 3]);
  assert.deepEqual(replaceRow(rows, "dl", null).map((r) => r.id), [1, 2]);
  assert.equal(rows.length, 3);
  for (const k of ["you", "me", "act", "fail", "eye", "note", "think"]) assert.ok(EVENT_KINDS[k], k);
  assert.equal(EVENT_KINDS.eye.tag, "eye");
});
