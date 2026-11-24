// Keyboard inset and the dock custom properties.
import { test } from "node:test";
import assert from "node:assert/strict";
import { keyboardInset, dockInsets } from "../../src/vanilla/insets.ts";
import { dom } from "./dom.mjs";

test("keyboard inset reads the visual viewport", () => {
  assert.equal(keyboardInset({ innerHeight: 664 }), 0);
  assert.equal(keyboardInset({ innerHeight: 664, visualViewport: { height: 664, offsetTop: 0 } }), 0);
  assert.equal(keyboardInset({ innerHeight: 664, visualViewport: { height: 380, offsetTop: 0 } }), 284);
  assert.equal(keyboardInset({ innerHeight: 664, visualViewport: { height: 380, offsetTop: 100 } }), 184);
  assert.equal(keyboardInset({ innerHeight: 664, visualViewport: { height: 332, offsetTop: 0, scale: 2 } }), 0);
  assert.equal(keyboardInset({ innerHeight: 664, visualViewport: { height: 700, offsetTop: 0 } }), 0);
});

test("dock insets write and remove the custom properties", () => {
  const d = dom('<div id="foot"></div>');
  const root = d.document.documentElement;
  const h = dockInsets(d.$("#foot"));
  assert.equal(root.style.getPropertyValue("--hb-kb"), "0px");
  assert.equal(root.style.getPropertyValue("--hb-foot-h"), "0px");
  assert.deepEqual(h.read(), { kb: 0, foot: 0 });
  h.dispose();
  assert.equal(root.style.getPropertyValue("--hb-kb"), "");
  assert.equal(root.style.getPropertyValue("--hb-foot-h"), "");
  d.close();
});
