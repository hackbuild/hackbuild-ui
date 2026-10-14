// lint-voice: the CLAUDE.md Language rules on a commit message or on files.
// A cut of hackbuild-fab tools/lint-voice.mjs: the same rules
// (tools/voice-rules.mjs) and the same ai-credit rule for commit messages,
// without the allow file and the archive reader.
// Usage:
//   node tools/lint-voice.mjs --stdin --kind commit|text|dom
//   node tools/lint-voice.mjs <file>...
// Exit 0 when no block finding remains, 1 on a block finding, 2 on a usage error.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { aiCredit } from "./ai-names.mjs";
import { KINDS, lintText } from "./voice-rules.mjs";

/** A commit message's hits: the voice rules for kind commit plus AI credit (tools/ai-names.json). */
export function lintCommit(path, text) {
  const found = lintText(path, text, "commit");
  for (const c of aiCredit(text)) found.push({ path, line: c.line, col: c.index + 1, rule: "ai-credit", severity: "block", text: c.text.slice(0, 48) });
  return found.sort((a, b) => a.line - b.line || a.col - b.col);
}

function usage(msg) {
  console.error(`lint-voice: ${msg}`);
  console.error("usage: lint-voice.mjs [--stdin --kind commit|text|dom | <file>...]");
  process.exit(2);
}

function main(argv) {
  const findings = [];
  let files = 0;
  if (argv.includes("--stdin")) {
    const k = argv.indexOf("--kind");
    const kind = k >= 0 ? argv[k + 1] : "text";
    if (!KINDS.includes(kind)) usage(`unknown kind ${kind}`);
    let text = readFileSync(0, "utf8");
    if (kind === "commit") text = text.split("\n").filter((l) => !l.startsWith("#")).join("\n");
    findings.push(...(kind === "commit" ? lintCommit(`<stdin:${kind}>`, text) : lintText(`<stdin:${kind}>`, text, kind)));
    files = 1;
  } else {
    const paths = argv.filter((a) => !a.startsWith("--"));
    const unknown = argv.filter((a) => a.startsWith("--"));
    if (unknown.length) usage(`unknown option ${unknown[0]}`);
    if (!paths.length) usage("name a file or pass --stdin");
    for (const p of paths) {
      findings.push(...lintText(p, readFileSync(p, "utf8")));
      files++;
    }
  }
  for (const x of findings) console.log(`${x.path}:${x.line}:${x.col} ${x.rule}${x.severity === "warn" ? " (warn)" : ""} ${x.text}`);
  const block = findings.filter((x) => x.severity === "block").length;
  console.log(`lint-voice: ${files} files, ${block} block, ${findings.length - block} warn`);
  process.exit(block ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main(process.argv.slice(2));
