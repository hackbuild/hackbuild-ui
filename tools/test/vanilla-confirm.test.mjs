// confirmInline and confirmDialog.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { confirmDialog, confirmInline } from "../../src/vanilla/confirm.ts";

test("inline: first press arms with keep beside, second press confirms", () => {
  const d = dom(`<div><button id="b" class="hb-btn hb-btn-sm">clear chat</button></div><p id="out">x</p>`);
  let done = 0;
  const h = confirmInline(d.$("#b"), { onConfirm: () => done++, label: "clear 12 messages" });
  const keep = d.$("#b").nextElementSibling;
  assert.equal(keep.hidden, true);
  assert.equal(keep.textContent, "keep");
  assert.equal(keep.className, "hb-btn hb-btn-2 hb-btn-sm");
  d.$("#b").focus();
  d.click(d.$("#b"));
  assert.equal(h.armed, true);
  assert.equal(d.$("#b").textContent, "clear 12 messages");
  assert.equal(d.$("#b").classList.contains("hb-btn-danger"), true);
  assert.equal(keep.hidden, false);
  assert.equal(d.document.activeElement, keep, "focus moves off the armed button");
  d.click(d.$("#b"));
  assert.equal(done, 1);
  assert.equal(h.armed, false);
  assert.equal(d.$("#b").textContent, "clear chat");
  h.dispose();
  assert.equal(d.$("#b").nextElementSibling, null, "the made keep button is removed");
  d.close();
});

test("inline: keep, Escape and a press elsewhere back out", () => {
  const d = dom(`<button id="b">forget</button><button id="k" hidden>keep</button><p id="out">x</p>`);
  let done = 0;
  const h = confirmInline(d.$("#b"), { onConfirm: () => done++, keep: d.$("#k") });
  d.click(d.$("#b"));
  d.click(d.$("#k"));
  assert.equal(h.armed, false);
  d.click(d.$("#b"));
  d.key(d.$("#k"), "Escape");
  assert.equal(h.armed, false);
  d.click(d.$("#b"));
  d.pointerdown(d.$("#out"));
  assert.equal(h.armed, false);
  assert.equal(done, 0);
  h.dispose();
  assert.ok(d.$("#k"), "a given keep button stays");
  d.close();
});

test("dialog store: asks queue and resolve in turn", async () => {
  const c = confirmDialog();
  const shown = [];
  c.subscribe((r) => shown.push(r?.title ?? null));
  const a = c.ask({ title: "wipe project" });
  const b = c.ask({ title: "wipe memory" });
  assert.equal(c.current.title, "wipe project");
  c.answer(true);
  assert.equal(await a, true);
  assert.equal(c.current.title, "wipe memory");
  c.answer(false);
  assert.equal(await b, false);
  assert.deepEqual(shown, ["wipe project", "wipe memory", null]);
  const left = c.ask({ title: "x" });
  c.dispose();
  assert.equal(await left, false);
});

test("dialog on a modal: words filled, focus on cancel for danger, Escape answers false", async () => {
  const d = dom(`<button id="go">wipe</button><div class="hb-modal" id="m"><div class="hb-panel">
    <h3 data-hb-confirm="title"></h3><p data-hb-confirm="message"></p>
    <button data-hb-confirm="cancel"></button><button class="hb-btn" data-hb-confirm="ok"></button></div></div>`);
  const c = confirmDialog({ el: d.$("#m") });
  const ok = d.$('[data-hb-confirm="ok"]');
  const cancel = d.$('[data-hb-confirm="cancel"]');
  d.$("#go").focus();
  const a = c.ask({ title: "wipe this project", message: "14 documents go.", confirmLabel: "wipe", danger: true });
  assert.equal(d.$("#m").hidden, false);
  assert.equal(d.$('[data-hb-confirm="title"]').textContent, "wipe this project");
  assert.equal(ok.textContent, "wipe");
  assert.equal(cancel.textContent, "cancel");
  assert.equal(ok.classList.contains("hb-btn-danger"), true);
  assert.equal(d.document.activeElement, cancel);
  d.key(cancel, "Escape");
  assert.equal(await a, false);
  assert.equal(d.$("#m").hidden, true);
  assert.equal(d.document.activeElement, d.$("#go"));
  const b = c.ask({ title: "export" });
  assert.equal(d.document.activeElement, ok);
  assert.equal(ok.classList.contains("hb-btn-danger"), false);
  d.click(ok);
  assert.equal(await b, true);
  assert.equal(d.$("#m").hidden, true);
  c.dispose();
  d.close();
});
