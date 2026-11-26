import { test } from "node:test";
import assert from "node:assert/strict";
import { members, parsePart } from "../catalogue.mjs";
import { badgeSizes, badges, sitePage, SITE } from "../check-readme.mjs";
import { oneLine } from "../llms.mjs";

test("catalogue reads props, defaults, models, events and slots", () => {
  const sfc = `<script setup lang="ts">
interface Props {
  /** The heading. */
  title: string
  size?:
    | 'sm'
    | 'lg'
}
const props = withDefaults(defineProps<Props>(), { size: 'sm' })
/** Open state. */
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  pick: [id: string]
}>()
</script>
<template><div><slot /><slot name="foot" /></div></template>`;
  const p = parsePart(sfc);
  assert.deepEqual(p.props, [
    { name: "title", type: "string", required: true, doc: "The heading." },
    { name: "size", type: "| 'sm' | 'lg'", required: false, default: "'sm'" },
  ]);
  assert.deepEqual(p.models, [{ name: "v-model:open", type: "boolean", doc: "Open state." }]);
  assert.deepEqual(p.events, [{ name: "pick", args: "id: string" }]);
  assert.deepEqual(p.slots, ["default", "foot"]);
});

test("members keeps nested objects whole", () => {
  assert.deepEqual(members("a: { b: number\n c: string }\nd?: () => void").map((m) => [m.key, m.value]), [["a", "{ b: number c: string }"], ["d", "() => void"]]);
});

test("size badges round trip", () => {
  const line = badges({ css: 71900, vanilla: 54500 });
  assert.deepEqual(badgeSizes(line), { css: 71900, vanilla: 54500 });
});

test("site links name a route or a served file", () => {
  const routes = ["/", "/components/:name", "/layouts/gate"];
  assert.equal(sitePage(`${SITE}#/components/HbChip`, routes), true);
  assert.equal(sitePage(`${SITE}#/layouts/gate`, routes), true);
  assert.equal(sitePage(`${SITE}#/nowhere`, routes), false);
  assert.equal(sitePage(`${SITE}llms.txt`, routes), true);
});

test("oneLine takes the first sentence", () => {
  assert.equal(oneLine("Draw a store, e.g. a bar. More here."), "Draw a store, e.g. a bar.");
});
