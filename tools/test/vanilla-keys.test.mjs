// Api key: shape check and the first 4 and last 4.
import { test } from "node:test";
import assert from "node:assert/strict";
import { maskKey, keyCheck } from "../../src/vanilla/keys.ts";

test("a key shows its first 4 and last 4; a short one shows stars", () => {
  assert.equal(maskKey("sk-ant-api03-abcdef9xQz"), "sk-a...9xQz");
  assert.equal(maskKey("abc"), "***");
  assert.equal(maskKey("  "), "");
});

test("the words walk from empty to waiting to valid", () => {
  assert.equal(keyCheck("", /^sk-ant-/).words, "enter your key to continue.");
  assert.equal(keyCheck("sk-xyz-123456", /^sk-ant-/).state, "waiting");
  const ok = keyCheck("sk-ant-api03-123456", "^sk-ant-");
  assert.equal(ok.valid, true);
  assert.equal(ok.words, "key looks valid.");
  assert.equal(keyCheck("1234567").valid, false);
  assert.equal(keyCheck("12345678").valid, true);
});
