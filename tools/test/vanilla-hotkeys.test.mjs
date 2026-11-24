// hotkeys: combos, mac mod, fields, scopes, conflicts, key map, dispose.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { hotkeys } from "../../src/vanilla/hotkeys.ts";

const setup = (mac = false) => {
  const d = dom(`<main id="m"></main><input id="i"><textarea id="ta"></textarea><input id="cb" type="checkbox">`);
  const log = [];
  const hk = hotkeys([], { target: d.window, mac });
  return { d, log, hk };
};

test("ctrl reads cmd on a mac and ctrl elsewhere; the key is taken", () => {
  for (const mac of [false, true]) {
    const { d, log, hk } = setup(mac);
    hk.add({ keys: "ctrl+k", label: "palette", run: () => log.push("k") });
    const e = d.key(d.$("#m"), "k", mac ? { metaKey: true } : { ctrlKey: true });
    assert.equal(e.defaultPrevented, true);
    d.key(d.$("#m"), "k", mac ? { ctrlKey: true } : { metaKey: true });
    d.key(d.$("#m"), "k");
    assert.deepEqual(log, ["k"]);
    assert.deepEqual(hk.format("ctrl+shift+z"), mac ? ["cmd", "shift", "z"] : ["ctrl", "shift", "z"]);
    hk.dispose();
    d.close();
  }
});

test("shift: named for letters, implied for symbols; alt digits match by code", () => {
  const { d, log, hk } = setup();
  hk.add([
    { keys: "ctrl+shift+z", label: "redo", run: () => log.push("redo") },
    { keys: "ctrl+z", label: "undo", run: () => log.push("undo") },
    { keys: "?", label: "key map", run: () => log.push("?") },
    { keys: "alt+1", label: "group 1", run: () => log.push("g1") },
  ]);
  d.key(d.$("#m"), "Z", { ctrlKey: true, shiftKey: true });
  d.key(d.$("#m"), "z", { ctrlKey: true });
  d.key(d.$("#m"), "?", { shiftKey: true });
  d.key(d.$("#m"), "¡", { altKey: true, code: "Digit1" });
  assert.deepEqual(log, ["redo", "undo", "?", "g1"]);
  hk.dispose();
  d.close();
});

test("typing in a field is ignored unless the key says inFields; a checkbox is not a field", () => {
  const { d, log, hk } = setup();
  hk.add([
    { keys: "/", label: "palette", run: () => log.push("/") },
    { keys: "esc", label: "stop", inFields: true, run: () => log.push("esc") },
  ]);
  d.key(d.$("#i"), "/");
  d.key(d.$("#ta"), "/");
  d.key(d.$("#cb"), "/");
  d.key(d.$("#ta"), "Escape");
  assert.deepEqual(log, ["/", "esc"]);
  hk.dispose();
  d.close();
});

test("a taken key, a repeat and a false return pass through", () => {
  const { d, log, hk } = setup();
  hk.add({ keys: "m", label: "models", run: () => (log.push("m"), false) });
  d.$("#m").addEventListener("keydown", (e) => { if (e.key === "x") e.preventDefault(); });
  hk.add({ keys: "x", label: "x", run: () => log.push("x") });
  const e = d.key(d.$("#m"), "m");
  assert.equal(e.defaultPrevented, false);
  d.key(d.$("#m"), "x");
  d.key(d.$("#m"), "m", { repeat: true });
  assert.deepEqual(log, ["m"]);
  hk.dispose();
  d.close();
});

test("scopes: the newest scope wins over global and only it is on", () => {
  const { d, log, hk } = setup();
  hk.add([
    { keys: "[", label: "previous tool", run: () => log.push("shell[") },
    { keys: "[", label: "brush smaller", scope: "masks", run: () => log.push("masks[") },
    { keys: "b", label: "brush", scope: "masks", run: () => log.push("b") },
    { keys: "c", label: "close", scope: "palette", run: () => log.push("c") },
  ]);
  d.key(d.$("#m"), "[");
  d.key(d.$("#m"), "b");
  const endMasks = hk.pushScope("masks");
  d.key(d.$("#m"), "[");
  d.key(d.$("#m"), "b");
  const endPal = hk.pushScope("palette");
  d.key(d.$("#m"), "b");
  d.key(d.$("#m"), "c");
  endPal();
  endPal();
  assert.deepEqual(hk.scopes, ["masks"]);
  endMasks();
  d.key(d.$("#m"), "[");
  assert.deepEqual(log, ["shell[", "masks[", "b", "c", "shell["]);
  hk.dispose();
  d.close();
});

test("a combo taken in the same scope throws; list groups visible keys; remove and dispose", () => {
  const { d, log, hk } = setup();
  const changes = [];
  hk.subscribe(() => changes.push(1));
  const remove = hk.add([
    { keys: ["/", "ctrl+k"], label: "palette", group: "shell", run: () => log.push("p") },
    { keys: "ctrl+s", label: "save now", group: "workspace", run() {} },
    { keys: "f12", label: "debug", hidden: true, run() {} },
  ]);
  assert.throws(() => hk.add({ keys: "mod+k", label: "other", run() {} }), /taken by "palette"/);
  assert.doesNotThrow(() => hk.add({ keys: "ctrl+k", label: "chat search", scope: "chat", run() {} }));
  assert.deepEqual(hk.list(), [
    { group: "shell", items: [{ keys: [["/"], ["ctrl", "k"]], label: "palette", scope: "global" }] },
    { group: "workspace", items: [{ keys: [["ctrl", "s"]], label: "save now", scope: "global" }] },
    { group: "general", items: [{ keys: [["ctrl", "k"]], label: "chat search", scope: "chat" }] },
  ]);
  remove();
  assert.equal(hk.list().length, 1);
  assert.equal(changes.length, 3);
  hk.add({ keys: "/", label: "palette", run: () => log.push("p") });
  hk.dispose();
  d.key(d.$("#m"), "/");
  assert.deepEqual(log, []);
  d.close();
});
