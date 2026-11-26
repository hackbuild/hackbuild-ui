#!/usr/bin/env node
// check-readme: the README follows the template every hackbuild library
// package follows (the same tool as in hackbuild-browser-ai, cut to one
// package at the repository root).
//
//   template  H1 is the package name, then one line saying what it does,
//             then the badge line (npm version, licence, gzip size of
//             dist/styles/hackbuild.css and dist/vanilla.js, types), then the
//             H2 sections below in this order. Optional ones may be left out;
//             no other H2 is allowed.
//   quick     examples/quick.ts exists, is 5 to 25 lines, and the first ts
//             block under "Quick start" is that file after trimming;
//             npm run typecheck compiles it. Every package it imports is the
//             package, a peer, or named in "Install".
//   install   "Install" holds npm install <package>.
//   api       "API overview" links to llms.md and the catalogue on the site.
//   text      no "not on npm" text, no internal design ids, no number label
//             in prose (labels belong in tables).
//   links     every relative link resolves to a file in the repository and,
//             with an anchor, to a heading in that file; a link into the
//             docs site names a route site/src/router.ts has.
//   size      each gzip badge is within 10 percent of the built file, so a
//             small change does not churn the README; --fix-badges rewrites
//             the line from dist.
// Usage: node tools/check-readme.mjs [--fix-badges]   (after npm run build)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
export const PKG = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
export const NAME = PKG.name;
export const SITE = "https://hackbuild.github.io/hackbuild-ui/";

/** [heading, required] in order. */
export const SECTIONS = [
  ["What it does", true],
  ["Install", true],
  ["Quick start", true],
  ["Live example", true],
  ["Concepts", true],
  ["API overview", true],
  ["Browser support", true],
  ["Errors and troubleshooting", true],
  ["Works with", true],
  ["Changelog and licences", true],
  ["Development", false],
];

/** Built files a size badge reports: [badge label, path under dist]. */
export const SIZED = [
  ["css", "styles/hackbuild.css"],
  ["vanilla", "vanilla.js"],
];

const PROSE_LABEL = /\((measured|vendor|computed|inferred)\b|\b(measured|vendor|computed|inferred)\)/;
const DESIGN_IDS = [
  [/\bP-[A-Z][A-Z0-9]*(-\d+)?\b/, "a pattern id"],
  [/\b(item|phase|row) [A-Z]?\d+(\.\d+)?\b/i, "an item or phase number"],
  [/§\s?\d/, "a design section number"],
  [/\bD\d{1,2}\b/, "a design decision id"],
  [/suite-design|REBUILD-PLAN|ui-harvest|ui-gap/, "an internal design file"],
];

const kb = (n) => `${(n / 1000).toFixed(1)} kB`;
const enc = (s) => encodeURIComponent(s).replace(/-/g, "--");

/** Gzip bytes of a built file, or null before a build. */
export function gzipOf(rel) {
  const file = join(root, "dist", rel);
  return existsSync(file) ? gzipSync(readFileSync(file), { level: 9 }).length : null;
}

/** The badge line, from the manifest and the sizes given ({ css: bytes, vanilla: bytes }). */
export function badges(sizes) {
  return [
    `[![npm](https://img.shields.io/npm/v/${NAME})](https://www.npmjs.com/package/${NAME})`,
    `[![licence MIT](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)`,
    ...SIZED.map(([label]) => (sizes[label] ? `![${label} gzip ${kb(sizes[label])} measured](https://img.shields.io/badge/${label}%20gzip-${enc(kb(sizes[label]))}-blue)` : null)),
    `![types included](https://img.shields.io/badge/types-included-blue)`,
  ].filter(Boolean).join(" ");
}

/** Sizes the badge line states, read back: { css: bytes, vanilla: bytes }. */
export function badgeSizes(line) {
  const out = {};
  for (const [label] of SIZED) {
    const m = new RegExp(`!\\[${label} gzip ([\\d.]+) kB measured\\]`).exec(line ?? "");
    if (m) out[label] = Math.round(Number(m[1]) * 1000);
  }
  return out;
}

/** GitHub style heading slug. */
export function slug(text) {
  return text.trim().toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
}

/** The text with fenced code blocks blanked, so headings and links inside code do not count. */
export function stripFences(md) {
  return md.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, (b) => b.replace(/[^\n]/g, " "));
}

/** Heading anchors a markdown file offers, with -1, -2 for repeats. */
export function anchors(md) {
  const out = new Set();
  const seen = new Map();
  for (const line of stripFences(md).split("\n")) {
    const h = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (!h) continue;
    const s = slug(h[1]);
    const n = seen.get(s) ?? 0;
    seen.set(s, n + 1);
    out.add(n ? `${s}-${n}` : s);
  }
  return out;
}

/** H2 sections: { lead, list: [{ title, body }] }. */
export function sections(md) {
  const plain = stripFences(md);
  const marks = [];
  for (const m of plain.matchAll(/^## (.+)$/gm)) marks.push({ title: m[1].trim(), at: m.index, start: m.index + m[0].length });
  const lead = md.slice(0, marks[0]?.at ?? md.length);
  const list = marks.map((k, i) => ({ title: k.title, body: md.slice(k.start, marks[i + 1]?.at ?? md.length) }));
  return { lead, list };
}

/** The first fenced block of a language, without its fences. */
export function firstBlock(text, langs = ["ts", "typescript", "js"]) {
  for (const m of text.matchAll(/^```(\w*)[^\n]*\n([\s\S]*?)^```\s*$/gm)) if (langs.includes(m[1])) return m[2];
  return null;
}

/** Package names a module imports. */
export function quickImports(code) {
  const out = new Set();
  for (const m of code.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"'.][^"']*)["']/g)) {
    const parts = m[1].split("/");
    out.add(m[1].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]);
  }
  return out;
}

/** Route paths of the docs site, from site/src/router.ts. */
export function siteRoutes() {
  const text = readFileSync(join(root, "site", "src", "router.ts"), "utf8");
  return [...text.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]).filter((p) => !p.includes("pathMatch"));
}

/** Whether a site link names a page: a hash route the router has, or a file the site serves. */
export function sitePage(url, routes, files = ["", "index.html", "vanilla.html", "llms.txt", "llms-full.txt", "llms.md", "quick.ts", "hackbuild-design-system.html", "hackbuild-kerf-replica.html", "playground/"]) {
  const rest = url.slice(SITE.length);
  const [file, hash = ""] = rest.split("#");
  if (!files.includes(file)) return false;
  if (!hash) return true;
  const path = hash.split("?")[0];
  return routes.some((r) => (r.includes(":") ? new RegExp(`^${r.replace(/:[^/]+/g, "[^/]+")}$`).test(path) : r === path));
}

/** Links in markdown prose that do not resolve. */
export function linkProblems(prose, routes) {
  const out = [];
  for (const m of prose.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const t = m[1];
    if (/^(mailto:|data:)/.test(t)) continue;
    if (t.startsWith(SITE)) {
      if (!sitePage(t, routes)) out.push(`link ${t} names no page or route the docs site has`);
      continue;
    }
    if (/^https?:/.test(t)) continue;
    const [path, hash] = t.split("#");
    const file = path ? resolve(root, decodeURIComponent(path)) : join(root, "README.md");
    if (!file.startsWith(root)) out.push(`link ${t} leaves the repository`);
    else if (!existsSync(file)) out.push(`link ${t} does not resolve`);
    else if (hash && /\.md$/.test(file) && !anchors(readFileSync(file, "utf8")).has(hash)) out.push(`link ${t}: no heading "${hash}" in ${file.slice(root.length + 1)}`);
  }
  return out;
}

/** Problems of the README, as strings. sizes: the built gzip sizes, or {} to skip the size check. */
export function checkReadme(md, { sizes = {}, quick = null, routes = [] } = {}) {
  const out = [];
  const lines = md.split("\n");
  if (lines[0] !== `# ${NAME}`) out.push(`first line is ${JSON.stringify(lines[0])}, legal is "# ${NAME}"`);
  const { lead, list } = sections(md);
  const paras = lead.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!paras[1] || paras[1].startsWith("[![") || paras[1].startsWith("#")) out.push("no one line description after the title");
  else if (paras[1].split("\n").length > 3) out.push("the description after the title runs past three lines; keep it to one sentence");
  const line = paras[2] ?? "";
  const stated = badgeSizes(line);
  if (line !== badges(stated)) out.push("badge line is not in the generated shape. fix: node tools/check-readme.mjs --fix-badges");
  for (const [label] of SIZED) {
    if (!sizes[label]) continue;
    if (!stated[label]) out.push(`no ${label} gzip badge. fix: node tools/check-readme.mjs --fix-badges`);
    else if (Math.abs(stated[label] - sizes[label]) / sizes[label] > 0.1) out.push(`${label} gzip badge says ${kb(stated[label])}, the build is ${kb(sizes[label])}. fix: node tools/check-readme.mjs --fix-badges`);
  }
  if (paras.length > 3) out.push("text between the badges and \"What it does\"; move it into a section");

  const titles = list.map((s) => s.title);
  const known = SECTIONS.map(([t]) => t);
  for (const t of titles) if (!known.includes(t)) out.push(`H2 "${t}" is not in the template`);
  const order = titles.filter((t) => known.includes(t)).map((t) => known.indexOf(t));
  for (let i = 1; i < order.length; i++) if (order[i] <= order[i - 1]) out.push(`H2 "${known[order[i]]}" is out of order or repeated`);
  for (const [t, req] of SECTIONS) if (req && !titles.includes(t)) out.push(`H2 "${t}" is missing`);
  const body = (t) => list.find((s) => s.title === t)?.body ?? "";

  if (!new RegExp(`npm install [^\\n]*${NAME.replace("/", "\\/")}\\b`).test(body("Install"))) out.push(`"Install" has no npm install ${NAME}`);
  if (quick === null) out.push("examples/quick.ts is missing");
  else {
    const block = firstBlock(body("Quick start"));
    if (block === null) out.push(`"Quick start" has no ts block`);
    else if (block.trim() !== quick.trim()) out.push(`"Quick start" block differs from examples/quick.ts`);
    const n = quick.trim().split("\n").length;
    if (n < 5 || n > 25) out.push(`examples/quick.ts is ${n} lines, keep it to 10 to 20`);
    const deps = new Set([NAME, ...Object.keys(PKG.dependencies ?? {}), ...Object.keys(PKG.peerDependencies ?? {})]);
    for (const dep of quickImports(quick)) if (!deps.has(dep) && !body("Install").includes(dep)) out.push(`quick.ts imports ${dep}; "Install" must name it or it must be a dependency`);
  }
  const api = body("API overview");
  if (!api.includes("(llms.md)")) out.push(`"API overview" has no link to llms.md`);
  if (!api.includes(`${SITE}#/components`)) out.push(`"API overview" has no link to the catalogue on the docs site`);

  const prose = stripFences(md);
  if (/not (yet )?on npm|unpublished/i.test(md)) out.push("says the package is not on npm");
  for (const [re, what] of DESIGN_IDS) {
    const m = re.exec(prose);
    if (m) out.push(`names ${what}: ${JSON.stringify(m[0])}`);
  }
  const words = prose.split("\n").filter((l) => !/^\s*\|/.test(l) && !/^#/.test(l) && !/^\[!\[npm\]/.test(l)).join("\n");
  const label = PROSE_LABEL.exec(words);
  if (label) out.push(`a number label in prose: ${JSON.stringify(label[0])}; put labelled numbers in a table`);
  for (const p of linkProblems(prose, routes)) out.push(p);
  return out;
}

function main() {
  const file = join(root, "README.md");
  let md = readFileSync(file, "utf8");
  const sizes = {};
  for (const [label, rel] of SIZED) {
    const n = gzipOf(rel);
    if (n) sizes[label] = n;
  }
  if (Object.keys(sizes).length < SIZED.length) console.error("check-readme: dist is missing, the size badges are not checked. fix: npm run build");
  if (process.argv.includes("--fix-badges")) {
    const next = md.replace(/^\[!\[npm\]\([^\n]*$/m, badges(sizes));
    if (next !== md) writeFileSync(file, (md = next));
  }
  const quickFile = join(root, "examples", "quick.ts");
  const quick = existsSync(quickFile) ? readFileSync(quickFile, "utf8") : null;
  const problems = checkReadme(md, { sizes, quick, routes: siteRoutes() });
  for (const p of problems) console.error(`check-readme: ${p}`);
  console.log(`check-readme: README.md, ${problems.length} problems`);
  process.exitCode = problems.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) main();
