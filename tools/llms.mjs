#!/usr/bin/env node
// llms: the files a coding agent reads. The same job as tools/llms.mjs in
// hackbuild-browser-ai, for the one package here. Generated, never hand edited:
//
//   llms.md             shipped in the tarball: purpose, install, every public
//                       export with its signature and one line doc, minimal
//                       examples, and the mistakes an agent makes.
//   docs/llms.txt       llmstxt.org format: an H1, a one paragraph blockquote,
//                       then sections of links. The docs site serves it at
//                       /llms.txt, with llms.md and quick.ts beside it.
//   docs/llms-full.txt  llms.txt followed by llms.md.
//
// Inputs: the README (one line, "What it does", "Install", ts blocks of
// "Quick start"), examples/quick.ts, site/src/catalogue.json (the parts,
// tools/catalogue.mjs writes it), the declarations in dist (npm run build
// writes them) and llms.json (the mistakes list, by hand, not shipped).
// Usage: node tools/llms.mjs [--check]
//   --check  fail when a generated file differs from what is on disk
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { catalogue } from "./catalogue.mjs";
import { NAME, SITE, sections } from "./check-readme.mjs";

const root = resolve(import.meta.dirname, "..");
export const REPO = "hackbuild-ui";
export const SUMMARY =
  "hackbuild-ui is the hack.build design system as one ESM package: design tokens as CSS custom properties, one stylesheet that styles every part as plain classes, Vue 3 components that add behaviour to those classes and carry no styles, and the same behaviour as vanilla functions for pages without Vue or opened from file://. Tool screens take one of six layouts (stage and rack, canvas and rail, drop first, conversation, gate, form and frame): one 52 px bar, one subject that fills, one 380 px rack, one pink action. GUIDELINES.md is the design law.";

/** The mistakes an agent makes with this package, from llms.json. */
export function mistakes() {
  const list = JSON.parse(readFileSync(join(root, "llms.json"), "utf8")).mistakes;
  if (!Array.isArray(list) || !list.length || list.some((m) => typeof m !== "string" || !m.trim())) throw new Error('llms: llms.json needs a non empty "mistakes" array of strings');
  return list;
}

// ---------------------------------------------------------------- declarations

const docText = (s) => s.replace(/^\/\*\*?|\*\/$/g, "").split("\n").map((l) => l.replace(/^\s*\*?\s?/, "")).join(" ").replace(/\s+/g, " ").trim();

/** The first sentence of a doc comment. */
export function oneLine(doc) {
  if (!doc) return "";
  const s = doc.replace(/\b(e\.g|i\.e|etc|vs)\./g, "$1\u0000");
  const m = /^(.+?\.)(\s|$)/.exec(s);
  return (m ? m[1] : s).replace(/\u0000/g, ".").replace(/@\w+.*$/, "").trim();
}

/** The statement starting at `at`, up to the semicolon or opening brace at depth 0. */
function statement(text, at, stopAtBrace) {
  let depth = 0;
  for (let i = at; i < text.length; i++) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "*") i = text.indexOf("*/", i + 2) + 1;
    else if (c === "'" || c === '"' || c === "`") {
      for (i++; i < text.length && text[i] !== c; i++) if (text[i] === "\\") i++;
    } else if (stopAtBrace && c === "{" && depth === 0) return text.slice(at, i);
    else if ("{([".includes(c)) depth++;
    else if ("})]".includes(c)) depth--;
    else if (c === ";" && depth === 0) return text.slice(at, i);
  }
  return text.slice(at);
}

const flat = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();
const cache = new Map();
const read = (f) => cache.get(f) ?? (cache.set(f, existsSync(f) ? readFileSync(f, "utf8") : ""), cache.get(f));
const dts = (from, spec) => {
  const base = resolve(dirname(from), spec);
  return [`${base}.d.ts`, join(base, "index.d.ts")].find((f) => existsSync(f)) ?? `${base}.d.ts`;
};

/** Declarations of one exported value name in a d.ts file, following re-exports: [{ text, doc }]. */
export function declarations(file, name, seen = new Set()) {
  const key = `${file}#${name}`;
  if (seen.has(key)) return [];
  seen.add(key);
  const text = read(file);
  const out = [];
  const re = new RegExp(`(^|\\n)((?:\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?)export declare (function|const|let|class|enum|abstract class) ${name.replace(/\$/g, "\\$")}\\b`, "g");
  for (const m of text.matchAll(re)) {
    const start = m.index + m[1].length + m[2].length;
    const kind = m[3];
    let body = flat(statement(text, start, kind.includes("class")).replace(/^export declare /, ""));
    if (kind === "const" || kind === "let") {
      const colon = body.indexOf(":");
      const eq = body.indexOf(" = ");
      if (body.length > 160) body = eq > 0 && (colon < 0 || eq < colon) ? `${body.slice(0, eq)} = ...` : `${body.slice(0, colon)}: ${body.slice(colon + 1, colon + 120).trim()} ...`;
    }
    const docs = [...m[2].matchAll(/\/\*\*[\s\S]*?\*\//g)];
    out.push({ text: body, doc: docs.length ? docText(docs.at(-1)[0]) : "" });
  }
  if (out.length) return out;
  for (const m of text.matchAll(/export \{([^}]*)\} from '([^']+)'/g)) {
    for (const part of m[1].split(",")) {
      const [orig, alias] = part.trim().split(/\s+as\s+/);
      if ((alias ?? orig) === name && !part.trim().startsWith("type ")) return declarations(dts(file, m[2]), orig, seen);
    }
  }
  for (const m of text.matchAll(/export \* from '([^']+)'/g)) {
    const found = declarations(dts(file, m[1]), name, seen);
    if (found.length) return found;
  }
  return [];
}

/** Value and type names an entry d.ts exports, Vue parts left out: { values, types }. */
export function exportNames(file, seen = new Set()) {
  const values = new Set();
  const types = new Set();
  if (seen.has(file)) return { values, types };
  seen.add(file);
  const text = read(file);
  for (const m of text.matchAll(/export (type )?\{([^}]*)\} from '([^']+)'/g)) {
    if (m[3].endsWith(".vue")) continue;
    for (const part of m[2].split(",").map((p) => p.trim()).filter(Boolean)) {
      const isType = !!m[1] || part.startsWith("type ");
      const name = part.replace(/^type\s+/, "").split(/\s+as\s+/).at(-1);
      (isType ? types : values).add(name);
    }
  }
  for (const m of text.matchAll(/export \* from '([^']+)'/g)) {
    const sub = dts(file, m[1]);
    for (const d of read(sub).matchAll(/export declare (?:function|const|let|class|enum) (\w+)/g)) values.add(d[1]);
    for (const d of read(sub).matchAll(/export (?:interface|type) (\w+)/g)) types.add(d[1]);
    const nested = exportNames(sub, seen);
    nested.values.forEach((v) => values.add(v));
    nested.types.forEach((t) => types.add(t));
  }
  for (const d of text.matchAll(/export declare (?:function|const|let|class|enum) (\w+)/g)) values.add(d[1]);
  for (const d of text.matchAll(/export (?:interface|type) (\w+)/g)) types.add(d[1]);
  return { values, types };
}

// ---------------------------------------------------------------- parts

/** One Vue part as a signature line. */
export function partText(name, p) {
  const props = [...p.models.map((m) => `"${m.name}"?: ${m.type}`), ...p.props.map((r) => `${r.name}${r.required ? "" : "?"}: ${r.type}${r.default !== undefined && r.default.length < 40 ? ` = ${r.default}` : ""}`)];
  const lines = [`<${name}> props { ${props.join("; ")} }`];
  if (p.events.length) lines.push(`  events { ${p.events.map((e) => `${e.name}: [${e.args}]`).join("; ")} }`);
  if (p.slots.length) lines.push(`  slots ${p.slots.join(", ")}`);
  return lines.join("\n");
}

// ---------------------------------------------------------------- readme

function readme() {
  const md = readFileSync(join(root, "README.md"), "utf8");
  const { lead, list } = sections(md);
  const paras = lead.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const body = (t) => (list.find((s) => s.title === t)?.body ?? "").trim();
  return { line: (paras[1] ?? "").replace(/\s*\n\s*/g, " "), body };
}

/** README relative links as absolute repository links. */
function absLinks(text) {
  return text.replace(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g, (_, p) => (p === "llms.md" ? `](${SITE}llms.md)` : `](https://github.com/hackbuild/${REPO}/blob/main/${p})`));
}

function tsBlocks(text) {
  return [...text.matchAll(/^```(ts|typescript|js)[^\n]*\n([\s\S]*?)^```\s*$/gm)].map((m) => m[2].trim());
}

/** Rows of the README errors table as "message (where): what to do". */
function errorRows(text) {
  const out = [];
  for (const line of text.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length >= 3 && !/^-+$/.test(cells[0]) && cells[0] !== "message") out.push(`${cells[0]} (${cells[1]}): ${cells[2]}`);
  }
  return out;
}

// ---------------------------------------------------------------- output

const ENTRIES = [
  [NAME, join(root, "dist", "index.d.ts")],
  [`${NAME}/vanilla`, join(root, "dist", "vanilla", "index.d.ts")],
];

/** llms.md. */
export function llmsMd() {
  for (const [, f] of ENTRIES) if (!existsSync(f)) throw new Error(`llms: ${f} is missing. fix: npm run build`);
  const r = readme();
  const cat = JSON.parse(catalogue());
  const out = [`# ${NAME}`, "", `> ${r.line}`, "", `Generated by tools/llms.mjs from the README, the components and the declarations of ${REPO}. Human docs: ${SITE}`, ""];
  out.push("## Purpose", "", absLinks(r.body("What it does")), "");
  out.push("## Install", "", absLinks(r.body("Install")), "");
  out.push("## Exports", "", `### ${NAME}: Vue parts`, "", "Grouped by the layout that uses them. Each part's live demo is at " + `${SITE}#/components/<Name>.`, "");
  for (const g of cat.groups) {
    const parts = g.entries.filter((e) => cat.parts[e.name]);
    if (!parts.length) continue;
    out.push(`#### ${g.category}`, "");
    for (const e of parts) out.push("```ts", partText(e.name, cat.parts[e.name]), "```", "", `${e.blurb}.`, "");
  }
  for (const [spec, file] of ENTRIES) {
    const { values, types } = exportNames(file);
    out.push(`### ${spec}${spec === NAME ? ": functions and values" : ""}`, "");
    for (const name of [...values].sort((a, b) => a.localeCompare(b))) {
      const decls = declarations(file, name);
      if (!decls.length) continue;
      out.push("```ts", ...decls.map((d) => d.text), "```", "", oneLine(decls.find((d) => d.doc)?.doc) || "(no summary)", "");
    }
    if (types.size) out.push(`Types: ${[...types].sort((a, b) => a.localeCompare(b)).join(", ")}.`, "");
  }
  out.push("### stylesheets and assets", "", absLinks(r.body("API overview").split("\n").filter((l) => /^\| `[^`]*\.css`|\/\*/.test(l)).map((l) => `- ${l.split("|")[1].trim()}: ${l.split("|")[2].trim()}`).join("\n")), "");
  const quick = readFileSync(join(root, "examples", "quick.ts"), "utf8").trim();
  const examples = [["quick start", quick], ...tsBlocks(r.body("Quick start")).filter((b) => b !== quick).slice(0, 2).map((b) => ["without Vue", b])];
  out.push("## Examples", "");
  for (const [t, code] of examples) out.push(`### ${t}`, "", "```ts", code, "```", "");
  out.push("## Mistakes to avoid", "", ...mistakes().map((m) => `- ${m}`));
  const errs = errorRows(r.body("Errors and troubleshooting"));
  if (errs.length) out.push("", "## Errors and warnings", "", ...errs.map((e) => `- ${e}`));
  return out.join("\n").trimEnd() + "\n";
}

/** docs/llms.txt in the llmstxt.org format. */
export function llmsTxt() {
  const r = readme();
  const layouts = ["stage-rack", "canvas-rail", "drop-first", "conversation", "gate", "form-frame"];
  return [
    `# ${REPO}`,
    "",
    `> ${SUMMARY}`,
    "",
    `Installs from npm as ${NAME}, ESM only, types included, MIT. llms.md lists every export with its signature, minimal examples and the mistakes to avoid. Code: https://github.com/hackbuild/${REPO}`,
    "",
    "## Packages",
    "",
    `- [${NAME}](${SITE}llms.md): ${absLinks(r.line)}`,
    "",
    "## Quick starts",
    "",
    `- [quick start](${SITE}quick.ts): the smallest Vue page with the stylesheet and three parts, typechecked in CI`,
    "",
    "## Docs",
    "",
    `- [guidelines](${SITE}#/guidelines): the design law: colour, type, structure, the six layouts, the screen shape, copy rules and the gates`,
    `- [catalogue](${SITE}#/components): every part grouped by layout, with when to use it, its props, events, slots and a live demo`,
    `- [tokens](${SITE}#/tokens): every design value as a CSS custom property`,
    ...layouts.map((l) => `- [${l.replace(/-/g, " ")} layout](${SITE}#/layouts/${l}): a live screen in that layout`),
    "",
    "## Optional",
    "",
    `- [llms-full.txt](${SITE}llms-full.txt): this file and llms.md in one file`,
    `- [vanilla gallery](${SITE}vanilla.html): the class layer and vanilla behaviour without Vue`,
  ].join("\n") + "\n";
}

function main() {
  const check = process.argv.includes("--check");
  const md = llmsMd();
  const txt = llmsTxt();
  const files = new Map([
    ["llms.md", md],
    [join("docs", "llms.txt"), txt],
    [join("docs", "llms-full.txt"), [txt, md].join("\n---\n\n")],
  ]);
  let stale = 0;
  for (const [rel, text] of files) {
    const file = join(root, rel);
    if ((existsSync(file) ? readFileSync(file, "utf8") : null) === text) continue;
    if (check) {
      stale += 1;
      console.error(`llms: ${rel} is stale. fix: npm run build && npm run docs`);
    } else writeFileSync(file, text);
  }
  console.log(`llms: ${files.size} files, ${check ? `${stale} stale` : "written"}`);
  process.exitCode = stale ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) main();
