#!/usr/bin/env node
// catalogue: the props, models, events and slots of every Vue part, read from
// src/components/Hb*.vue, grouped by the layout that uses them
// (site/src/registry.ts). The docs site shows it under each live demo and
// tools/llms.mjs writes it into llms.md. Generated, never hand edited.
//
//   site/src/catalogue.json   { groups: [{ category, entries: [{ name, blurb }] }],
//                               parts: { HbX: { props, models, events, slots } } }
//
// Usage: node tools/catalogue.mjs [--check]
//   --check  fail when site/src/catalogue.json differs from what the parts say now
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
export const OUT = join("site", "src", "catalogue.json");

const OPEN = "{([";
const CLOSE = "})]";

/** The text between the brace at `at` and its match. */
export function braced(text, at) {
  let depth = 0;
  for (let i = at; i < text.length; i++) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "*") i = text.indexOf("*/", i + 2) + 1;
    else if (c === "/" && text[i + 1] === "/") i = text.indexOf("\n", i);
    else if (c === "'" || c === '"' || c === "`") {
      for (i++; i < text.length && text[i] !== c; i++) if (text[i] === "\\") i++;
    } else if (OPEN.includes(c)) depth++;
    else if (CLOSE.includes(c) && --depth === 0) return text.slice(at + 1, i);
    if (i < 0) break;
  }
  return "";
}

const clean = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "").replace(/\s+/g, " ").trim();
const docText = (s) => s.replace(/^\/\*\*?|\*\/$/g, "").split("\n").map((l) => l.replace(/^\s*\*?\s?/, "")).join(" ").replace(/\s+/g, " ").trim();

/**
 * Top level members of an object type or object literal body: [{ key, value, doc }].
 * A member starts on a line that opens with `key:` or `key?:` at depth 0;
 * the lines after it, up to the next member, continue it.
 */
export function members(body, { commas = false } = {}) {
  if (commas) body = breakCommas(body);
  const out = [];
  let depth = 0;
  let doc = "";
  let cur = null;
  const lines = body.split("\n");
  let inDoc = null;
  for (const line of lines) {
    if (inDoc !== null) {
      inDoc += "\n" + line;
      if (line.includes("*/")) {
        doc = docText(inDoc);
        inDoc = null;
      }
      continue;
    }
    const t = line.trim();
    if (depth === 0 && /^\/\*/.test(t)) {
      if (t.includes("*/")) doc = docText(t);
      else inDoc = t;
      continue;
    }
    const m = depth === 0 ? /^(readonly\s+)?(['"]?)([\w:$-]+)\2(\?)?\s*:\s*(.*)$/.exec(t) : null;
    if (m) {
      cur = { key: m[3], optional: !!m[4], value: m[5], doc };
      out.push(cur);
      doc = "";
    } else if (cur && t && !/^\/\//.test(t)) cur.value += " " + t;
    for (const c of clean(line)) {
      if (OPEN.includes(c)) depth++;
      else if (CLOSE.includes(c)) depth--;
    }
  }
  for (const m of out) m.value = clean(m.value).replace(/[,;]$/, "").trim();
  return out;
}

/** The text with a line break after every comma at depth 0, for one line object literals. */
export function breakCommas(text) {
  let out = "";
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      for (; j < text.length && text[j] !== c; j++) if (text[j] === "\\") j++;
      out += text.slice(i, j + 1);
      i = j;
      continue;
    }
    if (OPEN.includes(c)) depth++;
    else if (CLOSE.includes(c)) depth--;
    out += c === "," && depth === 0 ? ",\n" : c;
  }
  return out;
}

/** The comment block right before index `at`, if any. */
function docBefore(text, at) {
  const head = text.slice(0, at).trimEnd();
  if (!head.endsWith("*/")) return "";
  return docText(head.slice(head.lastIndexOf("/*")));
}

/** Props, models, events and slots of one single file component. */
export function parsePart(sfc) {
  const script = /<script setup[^>]*>([\s\S]*?)<\/script>/.exec(sfc)?.[1] ?? "";
  const template = sfc.replace(/<script[\s\S]*?<\/script>/g, "");
  const part = { props: [], models: [], events: [], slots: [] };
  const pi = /interface Props\b[^{]*\{/.exec(script);
  const defaults = new Map();
  const wd = /withDefaults\(\s*defineProps<Props>\(\)\s*,\s*\{/.exec(script);
  if (wd) for (const d of members(braced(script, wd.index + wd[0].length - 1), { commas: true })) defaults.set(d.key, d.value);
  if (pi) {
    for (const m of members(braced(script, pi.index + pi[0].length - 1))) {
      const row = { name: m.key, type: m.value, required: !m.optional };
      if (defaults.has(m.key)) row.default = defaults.get(m.key);
      if (m.doc) row.doc = m.doc;
      part.props.push(row);
    }
  }
  for (const m of script.matchAll(/defineModel<([^>]*(?:<[^>]*>[^>]*)*)>\(\s*(?:'([\w-]+)')?/g)) {
    const row = { name: m[2] ? `v-model:${m[2]}` : "v-model", type: clean(m[1]) };
    const doc = docBefore(script, script.lastIndexOf("\n", m.index));
    if (doc) row.doc = doc;
    part.models.push(row);
  }
  const em = /defineEmits<\s*\{/.exec(script);
  if (em) {
    const body = braced(script, em.index + em[0].length - 1);
    if (/^\s*\(/m.test(body)) {
      for (const m of body.matchAll(/\(\s*e(?:vent)?\s*:\s*'([\w:-]+)'\s*,?\s*([^)]*)\)/g)) part.events.push({ name: m[1], args: clean(m[2]) });
    } else for (const m of members(body)) part.events.push({ name: m.key, args: m.value.replace(/^\[|\]$/g, ""), ...(m.doc ? { doc: m.doc } : {}) });
  }
  const slots = new Set();
  for (const m of template.matchAll(/<slot\b([^>]*)>/g)) {
    const name = /(?:^|\s)name="([^"]+)"/.exec(m[1])?.[1] ?? /:name="`([^`]+)`"/.exec(m[1])?.[1] ?? (/:name=/.test(m[1]) ? "(dynamic)" : "default");
    slots.add(name);
  }
  part.slots = [...slots];
  return part;
}

/** The registry groups, read from site/src/registry.ts without running it. */
export function registryGroups() {
  const text = readFileSync(join(root, "site", "src", "registry.ts"), "utf8");
  const groups = [];
  for (const line of text.split("\n")) {
    const c = /category:\s*'([^']+)'/.exec(line);
    if (c) groups.push({ category: c[1], entries: [] });
    const e = /\{\s*name:\s*'([^']+)',\s*blurb:\s*'((?:[^'\\]|\\.)*)'/.exec(line);
    if (e && groups.length) groups.at(-1).entries.push({ name: e[1], blurb: e[2].replace(/\\'/g, "'") });
  }
  return groups;
}

/** The whole catalogue as JSON text. */
export function catalogue() {
  const dir = join(root, "src", "components");
  const parts = {};
  for (const f of readdirSync(dir).filter((f) => /^Hb\w+\.vue$/.test(f)).sort()) parts[f.slice(0, -4)] = parsePart(readFileSync(join(dir, f), "utf8"));
  return JSON.stringify({ groups: registryGroups(), parts }, null, 1) + "\n";
}

function main() {
  const check = process.argv.includes("--check");
  const text = catalogue();
  const file = join(root, OUT);
  const now = existsSync(file) ? readFileSync(file, "utf8") : null;
  const data = JSON.parse(text);
  const listed = new Set(data.groups.flatMap((g) => g.entries.map((e) => e.name)));
  const missing = Object.keys(data.parts).filter((n) => !listed.has(n));
  if (missing.length) console.error(`catalogue: not in site/src/registry.ts: ${missing.join(", ")}`);
  if (now === text) console.log(`catalogue: ${Object.keys(data.parts).length} parts, up to date`);
  else if (check) {
    console.error(`catalogue: ${OUT} is stale. fix: node tools/catalogue.mjs`);
    process.exitCode = 1;
  } else {
    writeFileSync(file, text);
    console.log(`catalogue: ${Object.keys(data.parts).length} parts, written`);
  }
  if (missing.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) main();
