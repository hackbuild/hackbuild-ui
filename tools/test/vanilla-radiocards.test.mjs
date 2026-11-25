// radioCards: one name, a radiogroup, title names and lines describe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { radioCards } from "../../src/vanilla/choice.ts";

const card = (v, t, d, tr, extra = "") => `<label class="hb-rcard"><input type="radio" value="${v}"${extra}><span class="hb-rcard-body"><span class="hb-rcard-title">${t}</span><span class="hb-rcard-desc">${d}</span>${tr ? `<span class="hb-rcard-trade">${tr}</span>` : ""}</span></label>`;
const CARDS = `<div id="g" class="hb-rcards" aria-label="who decides">${card("model", "the model", "it picks every action.", "")}${card("hints", "the model, with hints", "every prompt carries a next step.", "longer prompts")}${card("reflex", "reflexes first", "plain orders run with no model call.", "", " disabled")}</div>`;

test("radio cards: group role, shared name, names and descriptions", () => {
  const d = dom(CARDS);
  const seen = [];
  const h = radioCards(d.$("#g"), { value: "hints", onChange: (v) => seen.push(v) });
  const [a, b, c] = d.document.querySelectorAll("input");
  assert.equal(d.$("#g").getAttribute("role"), "radiogroup");
  assert.ok(a.name && a.name === b.name && b.name === c.name);
  assert.equal(h.value, "hints");
  assert.equal(b.checked, true);
  assert.equal(d.document.getElementById(b.getAttribute("aria-labelledby")).textContent, "the model, with hints");
  const desc = b.getAttribute("aria-describedby").split(" ").map((id) => d.document.getElementById(id).textContent);
  assert.deepEqual(desc, ["every prompt carries a next step.", "longer prompts"]);
  assert.equal(a.getAttribute("aria-describedby").split(" ").length, 1);
  assert.equal(c.closest(".hb-rcard").classList.contains("is-disabled"), true);
  a.checked = true;
  a.dispatchEvent(new d.window.Event("change", { bubbles: true }));
  assert.equal(h.value, "model");
  assert.deepEqual(seen, ["model"]);
  h.set("hints");
  assert.equal(h.value, "hints");
  assert.deepEqual(seen, ["model"], "set does not call onChange");
  h.dispose();
  d.close();
});
