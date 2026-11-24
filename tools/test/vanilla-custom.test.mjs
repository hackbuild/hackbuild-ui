// Custom model form: ids, fields by mode, the failure named per field.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveId, customFields, customErrors, customId, checkText } from "../../src/vanilla/custom.ts";

test("the id comes from the last part of a weights url", () => {
  assert.equal(deriveId("https://huggingface.co/u/Llama-8B-q4f16_1-MLC/"), "Llama-8B-q4f16_1-MLC");
  assert.equal(deriveId("https://huggingface.co/u/m/resolve/main/x.bin"), "m");
  assert.equal(deriveId("not a url"), "");
});

test("mlc shows the base select or the wasm url, never both", () => {
  const keys = (v) => customFields("mlc", v).map((f) => f.key);
  assert.ok(keys({ lib: "base" }).includes("base"));
  assert.ok(!keys({ lib: "base" }).includes("wasm"));
  assert.ok(keys({ lib: "url" }).includes("wasm"));
});

test("each field names how it fails", () => {
  assert.deepEqual(customErrors("onnx", { repo: "no-slash" }), { repo: "owner/name, with one slash." });
  assert.deepEqual(customErrors("gguf", { repo: "a/b", file: "x.bin" }), { file: "the file must end in .gguf." });
  assert.deepEqual(customErrors("mlc", { url: "http://x/y", lib: "url", wasm: "ftp://z" }), { wasm: "the wasm url must start with https://" });
  assert.deepEqual(customErrors("endpoint", { url: "http://localhost:11434/v1", model: "m", ctx: "100" }), { ctx: "512 or more." });
  assert.deepEqual(customErrors("onnx", { repo: "a/b" }, ["a/b"]), { repo: "a/b is already in the list." });
  assert.deepEqual(customErrors("onnx", { repo: "a/b" }), {});
});

test("ids and check words", () => {
  assert.equal(customId("gguf", { repo: "a/b", file: "m.gguf" }), "a/b:m.gguf");
  assert.equal(customId("mlc", { url: "https://h/u/M-MLC" }), "M-MLC");
  assert.match(checkText(null), /not checked/);
  assert.match(checkText({ state: "fail" }), /check failed/);
});
