// toolSignature and toolList: the tool list the model sees.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { toolSignature, toolList, NO_TOOLS } from "../../src/vanilla/trace.ts";

test("tool signature: name and argument names", () => {
  assert.equal(toolSignature({ name: "walk", args: ["target"] }), "walk(target)");
  assert.equal(toolSignature({ name: "put", args: ["thing", "where"] }), "put(thing, where)");
  assert.equal(toolSignature({ name: "drop" }), "drop()");
  assert.equal(toolSignature("sit()"), "sit()");
});

test("tool list: one row per tool, empty says free text", () => {
  const d = dom(`<ul id="t" class="hb-pinsp-tools"></ul>`);
  const el = d.$("#t");
  const n = toolList(el, [{ name: "walk", args: ["target"], desc: "walk to a thing" }, { name: "drop" }]);
  assert.equal(n, 2);
  const rows = el.querySelectorAll("li");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].querySelector(".hb-pinsp-sig").textContent, "walk(target)");
  assert.equal(rows[0].querySelector(".hb-pinsp-desc").textContent, "walk to a thing");
  assert.equal(rows[1].querySelector(".hb-pinsp-desc"), null);
  assert.equal(el.classList.contains("is-empty"), false);
  assert.equal(toolList(el, []), 0);
  assert.equal(el.textContent, NO_TOOLS);
  assert.equal(el.classList.contains("is-empty"), true);
});
