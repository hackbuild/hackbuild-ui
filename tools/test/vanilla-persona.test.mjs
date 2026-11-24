// persona and trace: template, cost, presets, file round trip, step and prompt text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PERSONA_TEMPLATE, tokenEstimate, costLine, insertTemplate, matchPersona, presetLabel, personaJson, parsePersona } from "../../src/vanilla/persona.ts";
import { stepLabel, clipText, msText, promptText, planText, costRows } from "../../src/vanilla/trace.ts";

test("template carries the seven headings and fills the name", () => {
  for (const h of ["Persona", "Voice", "Background", "Behavior", "Boundaries", "Format", "Example"]) assert.match(PERSONA_TEMPLATE, new RegExp(`# ${h}`));
  assert.equal(insertTemplate("", "hi [NAME]", "rook"), "hi rook");
  assert.equal(insertTemplate("keep this  \n", "hi [NAME]"), "keep this\n\nhi [NAME]");
});

test("cost estimate and line", () => {
  assert.equal(tokenEstimate(""), 0);
  assert.equal(tokenEstimate("abcde"), 2);
  assert.equal(costLine(0), "empty: the model gets no persona");
  assert.equal(costLine(312), "about 312 tokens, sent every turn");
});

test("presets match on name and prompt; labels stay unique", () => {
  const f = { v: 1, name: "rook", prompt: "p" };
  const ps = [{ label: "rook", file: f }, { label: "rook 2", file: { ...f, prompt: "q" } }];
  assert.equal(matchPersona(ps, { ...f, prompt: "q" }), 1);
  assert.equal(matchPersona(ps, { ...f, prompt: "z" }), -1);
  assert.equal(presetLabel(ps, "rook"), "rook 3");
  assert.equal(presetLabel(ps, " "), "untitled");
});

test("character file round trip, old field names, named failures", () => {
  const f = { v: 1, name: "rook", prompt: "you are rook", model: "m", params: { temperature: 0.7 }, voice: "af" };
  assert.deepEqual(parsePersona(personaJson(f)), f);
  assert.deepEqual(parsePersona(JSON.stringify({ charName: "a", systemPrompt: "b", temperature: 1 })), { v: 1, name: "a", prompt: "b" });
  assert.deepEqual(parsePersona(JSON.stringify({ prompt: "x", params: { t: 1, bad: "no" } })).params, { t: 1 });
  assert.throws(() => parsePersona("{"), /not json/);
  assert.throws(() => parsePersona("[]"), /no object/);
  assert.throws(() => parsePersona("{}"), /no prompt/);
  assert.throws(() => parsePersona(JSON.stringify({ v: 2, prompt: "x" })), /version 2/);
});

test("step label, clip and time", () => {
  assert.equal(stepLabel(1), "step 01");
  assert.equal(stepLabel(12), "step 12");
  assert.equal(clipText("short", 10), "short");
  assert.equal(clipText("the mug is on the shelf now", 14), "the mug is on...");
  assert.equal(clipText("abcdefghij", 4), "abcd...");
  assert.equal(clipText("keep all", 0), "keep all");
  assert.equal(msText(840), "840 ms");
  assert.equal(msText(2400), "2.4 s");
  assert.equal(msText(-1), "");
});

test("prompt, plan and cost text", () => {
  assert.equal(promptText([{ role: "system", content: "a" }, { role: "user", content: "b" }]), "[system]\na\n\n[user]\nb");
  assert.equal(promptText("raw"), "raw");
  assert.equal(planText({ say: "ok", do: [] }), '{"say":"ok","do":[]}');
  assert.equal(planText(undefined), "");
  assert.deepEqual(costRows({ in: 812, out: 40, ms: 930 }, [["model calls", 3]]), [
    ["last prompt", "812 tokens"], ["last reply", "40 tokens"], ["reply time", "930 ms"], ["model calls", "3"],
  ]);
});
