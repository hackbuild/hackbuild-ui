// One root class, one part. A part's first class in the GUIDELINES class
// tables is its root; no other part may claim that class. Two blocks on one
// root let the later rule win, which pinned the chat context meter over the
// header when it shared .hb-ctx with the context menu.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROW = /^\| `(Hb[A-Za-z0-9]+)` \| ([^|]*)\|/;
const CLS = /`\.(hb-[a-z0-9-]+)`/g;

export function rootClashes(md) {
  const claims = new Map();
  const roots = new Map();
  for (const line of md.split("\n")) {
    const r = line.match(ROW);
    if (!r) continue;
    const found = [...r[2].matchAll(CLS)].map((m) => m[1]);
    if (!found.length) continue;
    if (!roots.has(found[0])) roots.set(found[0], r[1]);
    for (const c of found) {
      if (!claims.has(c)) claims.set(c, new Set());
      claims.get(c).add(r[1]);
    }
  }
  const out = [];
  for (const [root, part] of roots) {
    const others = [...claims.get(root)].filter((p) => p !== part);
    if (others.length) out.push(`${root}: ${part} and ${others.join(", ")}`);
  }
  return out;
}

test("no root class is claimed by two parts", () => {
  const md = readFileSync(new URL("../../GUIDELINES.md", import.meta.url), "utf8");
  assert.deepEqual(rootClashes(md), []);
});

test("a shared root is caught", () => {
  const md = "| `HbA` | `.hb-x`, `-hd` | a |\n| `HbB` | `.hb-x-area`, `.hb-x` | b |\n";
  assert.deepEqual(rootClashes(md), ["hb-x: HbA and HbB"]);
});
