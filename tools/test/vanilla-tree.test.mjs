// tree: roving focus, open and close, step in and out, pick, click twist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
import { tree } from "../../src/vanilla/tree.ts";

const MARKUP = `<ul class="hb-tree" id="t">
  <li role="treeitem" data-id="hips" aria-expanded="true"><span class="hb-tree-row"><span class="hb-tree-twist"></span>hips</span>
    <ul role="group">
      <li role="treeitem" data-id="spine" aria-expanded="false"><span class="hb-tree-row"><span class="hb-tree-twist"></span>spine</span>
        <ul role="group"><li role="treeitem" data-id="neck"><span class="hb-tree-row">neck</span></li></ul>
      </li>
      <li role="treeitem" data-id="leg"><span class="hb-tree-row">leg</span></li>
    </ul>
  </li>
</ul>`;

test("arrows walk open rows, right opens and steps in, left closes and steps out", () => {
  const d = dom(MARKUP);
  const toggles = [];
  const h = tree(d.$("#t"), { onToggle: (id, open) => toggles.push([id, open]) });
  const $id = (id) => d.$(`[data-id="${id}"]`);
  assert.equal(d.$("#t").getAttribute("role"), "tree");
  assert.equal($id("hips").tabIndex, 0);
  assert.equal($id("spine").tabIndex, -1);
  d.key($id("hips"), "ArrowDown");
  assert.equal(d.document.activeElement, $id("spine"));
  d.key($id("spine"), "ArrowDown");
  assert.equal(d.document.activeElement, $id("leg"), "closed spine hides neck");
  d.key($id("leg"), "ArrowUp");
  d.key($id("spine"), "ArrowRight");
  assert.equal($id("spine").getAttribute("aria-expanded"), "true");
  d.key($id("spine"), "ArrowRight");
  assert.equal(d.document.activeElement, $id("neck"));
  d.key($id("neck"), "ArrowLeft");
  assert.equal(d.document.activeElement, $id("spine"));
  d.key($id("spine"), "ArrowLeft");
  assert.equal($id("spine").getAttribute("aria-expanded"), "false");
  d.key($id("spine"), "End");
  assert.equal(d.document.activeElement, $id("leg"));
  d.key($id("leg"), "Home");
  assert.equal(d.document.activeElement, $id("hips"));
  assert.deepEqual(toggles, [["spine", true], ["spine", false]]);
  h.dispose();
  d.close();
});

test("enter and click pick, the twist toggles, select opens the path", () => {
  const d = dom(MARKUP);
  const picks = [];
  const h = tree(d.$("#t"), { onSelect: (id) => picks.push(id) });
  const $id = (id) => d.$(`[data-id="${id}"]`);
  d.key($id("hips"), "Enter");
  assert.equal($id("hips").getAttribute("aria-selected"), "true");
  d.click($id("leg").querySelector(".hb-tree-row"));
  assert.equal(h.value, "leg");
  assert.equal($id("hips").hasAttribute("aria-selected"), false);
  d.click($id("spine").querySelector(".hb-tree-twist"));
  assert.equal($id("spine").getAttribute("aria-expanded"), "true");
  assert.equal(h.value, "leg", "the twist does not pick");
  h.expand("spine", false);
  h.select("neck");
  assert.equal($id("spine").getAttribute("aria-expanded"), "true");
  assert.equal($id("neck").tabIndex, 0);
  assert.deepEqual(picks, ["hips", "leg", "neck"]);
  h.dispose();
  d.close();
});
