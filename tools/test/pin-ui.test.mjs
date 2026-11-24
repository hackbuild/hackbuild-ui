// tools/pin-ui.mjs on a fixture consumer: a pin written by writePin holds,
// and each way a pin drifts is named.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PKG, checkRepo, depSpec, formatPin, parsePin, readFromTgz, samePin, tarballName, writePin } from "../pin-ui.mjs";

const COMMIT = "5211c3a".padEnd(40, "0");

/** A tarball laid out like npm pack output, made with the system tar. */
function makeTgz(dir, version) {
  const src = join(dir, `src-${version}`);
  mkdirSync(join(src, "package"), { recursive: true });
  writeFileSync(join(src, "package", "package.json"), JSON.stringify({ name: PKG, version }));
  const out = join(dir, `kit-${version}.tgz`);
  const r = spawnSync("tar", ["-czf", out, "-C", src, "package"]);
  assert.equal(r.status, 0);
  return out;
}

/** A consumer on an old tarball, then moved by writePin with the lockfile npm install would write. */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "pin-ui-test-"));
  const repo = join(dir, "consumer");
  mkdirSync(join(repo, "tools", "vendor"), { recursive: true });
  writeFileSync(join(repo, "tools", "vendor", "hackbuild-ui-0.4.3-692e0a4.tgz"), "old");
  writeFileSync(join(repo, "tools", "vendor", "SHA256SUMS"), `${"a".repeat(64)}  hackbuild-ui-0.4.3-692e0a4.tgz\n${"b".repeat(64)}  other.bin\n`);
  writeFileSync(join(repo, "package.json"), `{\n  "name": "consumer",\n  "devDependencies": {\n    "${PKG}": "file:tools/vendor/hackbuild-ui-0.4.3-692e0a4.tgz"\n  }\n}\n`);
  const tgz = makeTgz(dir, "0.5.0");
  const bytes = readFileSync(tgz);
  const pin = { version: "0.5.0", commit: COMMIT, tarball: tarballName("0.5.0", COMMIT), sha256: createHash("sha256").update(bytes).digest("hex") };
  writePin(repo, tgz, pin);
  const spec = depSpec(pin.tarball);
  const lock = {
    name: "consumer",
    lockfileVersion: 3,
    packages: {
      "": { name: "consumer", devDependencies: { [PKG]: spec } },
      [`node_modules/${PKG}`]: { version: "0.5.0", resolved: spec, integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}` },
    },
  };
  writeFileSync(join(repo, "package-lock.json"), JSON.stringify(lock, null, 2));
  return { dir, repo, pin, lock, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test("the pin file round trips", () => {
  const pin = { version: "0.5.0", commit: COMMIT, tarball: "hackbuild-ui-0.5.0-5211c3a.tgz", sha256: "c".repeat(64) };
  assert.deepEqual(parsePin(formatPin(pin)), pin);
  assert.equal(tarballName("0.5.0", COMMIT), "hackbuild-ui-0.5.0-5211c3a.tgz");
});

test("writePin moves the tarball, the sums line, the pin and the dependency, and the pin holds", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const vendor = join(f.repo, "tools", "vendor");
  assert.deepEqual(checkRepo(f.repo).errors, []);
  assert.equal(readFileSync(join(vendor, "SHA256SUMS"), "utf8"), `${f.pin.sha256}  ${f.pin.tarball}\n${"b".repeat(64)}  other.bin\n`);
  assert.match(readFileSync(join(f.repo, "package.json"), "utf8"), new RegExp(`"file:tools/vendor/${f.pin.tarball}"`));
  assert.equal(JSON.parse(readFromTgz(readFileSync(join(vendor, f.pin.tarball)), "package/package.json")).version, "0.5.0");
});

test("a changed tarball fails on its hash", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  writeFileSync(join(f.repo, "tools", "vendor", f.pin.tarball), readFileSync(makeTgz(f.dir, "0.5.1")));
  const { errors } = checkRepo(f.repo);
  assert.ok(errors.some((e) => e.includes("hashes to")));
  assert.ok(errors.some((e) => e.includes("carries")));
  assert.ok(errors.some((e) => e.includes("package-lock.json has")));
});

test("a stale lockfile, a second tarball and a hand edited dependency are named", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  f.lock.packages[`node_modules/${PKG}`].resolved = "file:tools/vendor/hackbuild-ui-0.4.3-692e0a4.tgz";
  writeFileSync(join(f.repo, "package-lock.json"), JSON.stringify(f.lock));
  writeFileSync(join(f.repo, "tools", "vendor", "hackbuild-ui-0.4.4-5fcf588.tgz"), "stray");
  const pkg = readFileSync(join(f.repo, "package.json"), "utf8");
  writeFileSync(join(f.repo, "package.json"), pkg.replace(f.pin.tarball, "hackbuild-ui-0.4.4-5fcf588.tgz"));
  const { errors } = checkRepo(f.repo);
  assert.ok(errors.some((e) => e.startsWith("tools/vendor holds")));
  assert.ok(errors.some((e) => e.startsWith("package.json depends")));
  assert.ok(errors.some((e) => e.startsWith("package-lock.json has")));
});

test("an installed copy from another tarball is named", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  mkdirSync(join(f.repo, "node_modules", PKG), { recursive: true });
  const hidden = structuredClone(f.lock);
  hidden.packages[`node_modules/${PKG}`].integrity = "sha512-old";
  writeFileSync(join(f.repo, "node_modules", ".package-lock.json"), JSON.stringify(hidden));
  assert.ok(checkRepo(f.repo).errors.some((e) => e.startsWith("node_modules has")));
});

test("a missing pin file is named, and pins differ when any field differs", () => {
  const dir = mkdtempSync(join(tmpdir(), "pin-ui-test-"));
  mkdirSync(join(dir, "tools", "vendor"), { recursive: true });
  assert.deepEqual(checkRepo(dir).errors, ["tools/vendor/hackbuild-ui.pin is missing"]);
  rmSync(dir, { recursive: true, force: true });
  const a = { version: "0.5.0", commit: COMMIT, sha256: "c".repeat(64) };
  assert.equal(samePin([a, { ...a }]), true);
  assert.equal(samePin([a, { ...a, sha256: "d".repeat(64) }]), false);
  assert.equal(samePin([a, undefined]), false);
});
