// What a reader of the published repository and the npm page sees: the
// licence the package declares, the author, the attribution settings, the
// install name in the docs, and a changelog entry for the current version.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AI_IDENTITY } from "../ai-names.mjs";

const root = join(import.meta.dirname, "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const pkg = JSON.parse(read("package.json"));
const OWNER = "Moheeb Zara <hackbuildvideo@gmail.com>";

test("package.json author is the owner", () => {
  assert.equal(pkg.author, OWNER);
});

test("package.json names no ai tool as a person", () => {
  for (const key of ["author", "contributors", "maintainers"]) {
    if (pkg[key] === undefined) continue;
    const text = JSON.stringify(pkg[key]);
    assert.equal(AI_IDENTITY.test(text), false, `${key} is ${text}`);
  }
});

test("LICENSE holds the licence package.json declares", () => {
  assert.equal(pkg.license, "MIT");
  const text = read("LICENSE");
  assert.match(text, /^MIT License\n\nCopyright \(c\) 2026 Moheeb Zara\n/);
  assert.equal(AI_IDENTITY.test(text), false);
});

test(".claude/settings.json empties the commit and pr attribution", () => {
  const s = JSON.parse(read(".claude/settings.json"));
  assert.deepEqual(s.attribution, { commit: "", pr: "" });
});

test("the commit-msg hook is executable and prepare points git at it", () => {
  assert.ok(statSync(join(root, ".githooks", "commit-msg")).mode & 0o111);
  assert.match(pkg.scripts.prepare, /core\.hooksPath \.githooks/);
});

test("the docs install the published package name", () => {
  const docs = ["README.md", ...readdirSync(join(root, "docs")).filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`)];
  for (const f of docs) {
    const lines = read(f).split("\n");
    lines.forEach((line, i) => {
      assert.equal(line.includes("@hackbuild/ui"), false, `${f}:${i + 1} names @hackbuild/ui, the package installs as ${pkg.name}`);
    });
  }
  assert.match(read("README.md"), new RegExp(`npm install ${pkg.name.replace("/", "\\/")}\\n`));
});

test("CHANGELOG has an entry for the package.json version", () => {
  assert.ok(existsSync(join(root, "CHANGELOG.md")));
  const heads = read("CHANGELOG.md").split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).split(" ")[0]);
  assert.equal(heads[0], pkg.version);
  assert.equal(AI_IDENTITY.test(read("CHANGELOG.md")), false);
});
