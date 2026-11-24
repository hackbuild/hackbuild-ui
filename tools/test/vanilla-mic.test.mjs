// Mic input: states, interim and final words, the gate, restart, blocked.
import { test } from "node:test";
import assert from "node:assert/strict";
import { micInput, micLive, MIC_WORDS } from "../../src/vanilla/mic.ts";

function fakeRec() {
  const r = { starts: 0, stops: 0, start() { r.starts++ }, stop() { r.stops++; r.onend?.() } };
  return r;
}
const result = (text, isFinal) => ({ resultIndex: 0, results: { length: 1, 0: { isFinal, 0: { transcript: text } } } });

test("no recognizer reads unsupported and names the way around", () => {
  const m = micInput({ make: () => null });
  assert.equal(m.state, "unsupported");
  m.start();
  assert.equal(m.state, "unsupported");
  assert.match(MIC_WORDS.unsupported.note, /type instead/);
});

test("start asks, then listens, hears, and passes interim and final words", () => {
  const r = fakeRec();
  const said = [];
  let speaking = false;
  const m = micInput({ make: () => r, gate: () => speaking, onInterim: (t) => said.push("i:" + t), onFinal: (t) => said.push("f:" + t) });
  const seen = [];
  m.subscribe((s) => seen.push(s));
  m.start();
  r.onstart();
  r.onspeechstart();
  r.onresult(result(" hello ", false));
  r.onresult(result("hello there", true));
  speaking = true;
  r.onresult(result("my own voice", true));
  speaking = false;
  assert.deepEqual(seen, ["asking", "listening", "hearing"]);
  assert.deepEqual(said, ["i:hello", "f:hello there"]);
  assert.equal(micLive(m.state), true);
  m.stop();
  assert.equal(m.state, "off");
});

test("a session the browser ends restarts; muteFor drops the tail", async () => {
  const r = fakeRec();
  let t = 0;
  const said = [];
  const m = micInput({ make: () => r, restartMs: 5, now: () => t, onFinal: (x) => said.push(x) });
  m.start();
  r.onend();
  await new Promise((res) => setTimeout(res, 20));
  assert.equal(r.starts, 2);
  m.muteFor(500);
  r.onresult(result("echo", true));
  t = 600;
  r.onresult(result("you", true));
  assert.deepEqual(said, ["you"]);
  m.dispose();
});

test("not-allowed blocks and stops restarting", () => {
  const r = fakeRec();
  const m = micInput({ make: () => r });
  m.start();
  r.onerror({ error: "not-allowed" });
  r.onend();
  assert.equal(m.state, "blocked");
  assert.match(MIC_WORDS.blocked.note, /type instead/);
});
