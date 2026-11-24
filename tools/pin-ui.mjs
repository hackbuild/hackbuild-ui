// pin-ui: puts every consumer of hackbuild-ui on one tarball, or checks a pin.
//
// Pin, run in the hackbuild-ui checkout:
//   node tools/pin-ui.mjs [commit]
// takes the commit (default main) out of git, builds it and packs it as
// hackbuild-ui-<version>-<shortsha>.tgz. In each consumer next to this
// checkout it then removes the old tarball from tools/vendor, copies the new
// one in, rewrites the file: dependency in package.json, the SHA256SUMS line
// and tools/vendor/hackbuild-ui.pin, copies this script to
// tools/vendor/pin-ui.mjs, and runs npm install so the lockfile follows.
// It fails when a consumer fails its check or the consumers end up on
// different pins.
//
// Check:
//   node tools/pin-ui.mjs --check           in hackbuild-ui: every consumer, and that they agree
//   node tools/vendor/pin-ui.mjs --check    in a consumer (its CI): this repo's pin
// A pin holds when tools/vendor has exactly the tarball the pin file names,
// its sha256 is the one in the pin file and in SHA256SUMS, package.json and
// package-lock.json point at it with its sha512 integrity, the tarball
// carries the pinned version, and an installed copy, when there is one, came
// from it. Only node builtins, so a consumer runs it before npm ci.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

export const PKG = "@virgilvox/hackbuild-ui";
export const PIN_FILE = "hackbuild-ui.pin";
export const VENDOR = join("tools", "vendor");
/** Sibling checkouts that consume the kit; the suite is pinned once it exists. */
export const CONSUMERS = ["hackbuild-browser-ai", "hackbuild-motion", "hackbuild-agents", "dog-simulator"];
export const OPTIONAL = ["hackbuild-suite"];
const NPM = ["-y", "npm@11.21.0"];
const TARBALL = /^hackbuild-ui-.+\.tgz$/;

export const tarballName = (version, commit) => `hackbuild-ui-${version}-${commit.slice(0, 7)}.tgz`;
export const depSpec = (tarball) => `file:tools/vendor/${tarball}`;
const digest = (algo, buf, enc) => createHash(algo).update(buf).digest(enc);

/** The pin file text: version, commit, tarball, sha256. */
export function formatPin(pin) {
  return `# written by hackbuild-ui tools/pin-ui.mjs; rerun it there, do not edit\nversion ${pin.version}\ncommit ${pin.commit}\ntarball ${pin.tarball}\nsha256 ${pin.sha256}\n`;
}

export function parsePin(text) {
  const pin = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([a-z0-9]+) (\S+)$/);
    if (m) pin[m[1]] = m[2];
  }
  return pin;
}

/** A file's bytes out of a gzipped tar, or undefined. Enough of ustar for npm pack output. */
export function readFromTgz(buf, want) {
  const tar = gunzipSync(buf);
  const str = (a, b) => tar.subarray(a, b).toString("utf8").replace(/\0.*$/s, "");
  for (let off = 0; off + 512 <= tar.length; ) {
    if (tar[off] === 0) break;
    const size = parseInt(str(off + 124, off + 136).trim() || "0", 8);
    const prefix = str(off + 345, off + 500);
    const name = (prefix ? `${prefix}/` : "") + str(off, off + 100);
    if (name === want) return tar.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return undefined;
}

/** Checks one repo's pin. Returns the pin as read and a list of findings, empty when it holds. */
export function checkRepo(dir) {
  const errors = [];
  const vendor = join(dir, VENDOR);
  const pinPath = join(vendor, PIN_FILE);
  if (!existsSync(pinPath)) return { pin: undefined, errors: [`${VENDOR}/${PIN_FILE} is missing`] };
  const pin = parsePin(readFileSync(pinPath, "utf8"));
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(pin.version ?? "")) errors.push(`pin version is "${pin.version}"`);
  if (!/^[0-9a-f]{40}$/.test(pin.commit ?? "")) errors.push(`pin commit is "${pin.commit}", want a full sha`);
  if (!/^[0-9a-f]{64}$/.test(pin.sha256 ?? "")) errors.push(`pin sha256 is "${pin.sha256}"`);
  if (errors.length) return { pin, errors };
  const want = tarballName(pin.version, pin.commit);
  if (pin.tarball !== want) errors.push(`pin tarball is ${pin.tarball}, version and commit make it ${want}`);

  const found = readdirSync(vendor).filter((f) => TARBALL.test(f));
  if (found.length !== 1 || found[0] !== want) errors.push(`${VENDOR} holds ${found.join(", ") || "no tarball"}, want only ${want}`);
  if (!existsSync(join(vendor, want))) return { pin, errors };

  const tgz = readFileSync(join(vendor, want));
  const sha256 = digest("sha256", tgz, "hex");
  if (sha256 !== pin.sha256) errors.push(`${want} hashes to ${sha256}, the pin says ${pin.sha256}`);
  const sums = existsSync(join(vendor, "SHA256SUMS")) ? readFileSync(join(vendor, "SHA256SUMS"), "utf8").split("\n").filter((l) => TARBALL.test(l.split(/\s+/).pop() ?? "")) : [];
  if (sums.length !== 1 || sums[0] !== `${pin.sha256}  ${want}`) errors.push(`SHA256SUMS has ${JSON.stringify(sums)}, want one line "${pin.sha256}  ${want}"`);

  const manifest = readFromTgz(tgz, "package/package.json");
  const packed = manifest ? JSON.parse(manifest.toString("utf8")) : {};
  if (packed.name !== PKG || packed.version !== pin.version) errors.push(`${want} carries ${packed.name}@${packed.version}, want ${PKG}@${pin.version}`);

  const spec = depSpec(want);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const dep = pkg.dependencies?.[PKG] ?? pkg.devDependencies?.[PKG];
  if (dep !== spec) errors.push(`package.json depends on ${PKG} ${dep}, want ${spec}`);

  const integrity = `sha512-${digest("sha512", tgz, "base64")}`;
  const lockEntry = (file, label) => {
    if (!existsSync(file)) return label === "package-lock.json" ? errors.push("package-lock.json is missing") : undefined;
    const lock = JSON.parse(readFileSync(file, "utf8"));
    const e = lock.packages?.[`node_modules/${PKG}`];
    if (!e || e.resolved !== spec || e.version !== pin.version || e.integrity !== integrity)
      errors.push(`${label} has ${PKG} ${e?.version} from ${e?.resolved} (${e?.integrity?.slice(0, 20)}...), want ${pin.version} from ${spec}; run npm install`);
    if (label === "package-lock.json") {
      const root = lock.packages?.[""] ?? {};
      const rdep = root.dependencies?.[PKG] ?? root.devDependencies?.[PKG];
      if (rdep !== spec) errors.push(`package-lock.json root asks for ${rdep}, want ${spec}; run npm install`);
    }
  };
  lockEntry(join(dir, "package-lock.json"), "package-lock.json");
  // the hidden lockfile describes what npm installed; absent before npm ci
  if (existsSync(join(dir, "node_modules", PKG))) lockEntry(join(dir, "node_modules", ".package-lock.json"), "node_modules");
  return { pin, errors };
}

/** True when every pin names the same version, commit and sha256. */
export function samePin(pins) {
  const key = (p) => `${p?.version} ${p?.commit} ${p?.sha256}`;
  return pins.every((p) => key(p) === key(pins[0]));
}

/** Rewrites one consumer onto the tarball at tgzPath; leaves the install to the caller. */
export function writePin(dir, tgzPath, pin, script) {
  const vendor = join(dir, VENDOR);
  mkdirSync(vendor, { recursive: true });
  for (const f of readdirSync(vendor)) if (TARBALL.test(f) && f !== pin.tarball) rmSync(join(vendor, f));
  copyFileSync(tgzPath, join(vendor, pin.tarball));
  const sumsPath = join(vendor, "SHA256SUMS");
  const line = `${pin.sha256}  ${pin.tarball}`;
  const old = existsSync(sumsPath) ? readFileSync(sumsPath, "utf8").split("\n").filter(Boolean) : [];
  const at = old.findIndex((l) => TARBALL.test(l.split(/\s+/).pop() ?? ""));
  const sums = old.filter((l) => !TARBALL.test(l.split(/\s+/).pop() ?? ""));
  sums.splice(at < 0 ? sums.length : at, 0, line);
  writeFileSync(sumsPath, `${sums.join("\n")}\n`);
  writeFileSync(join(vendor, PIN_FILE), formatPin(pin));
  if (script) copyFileSync(script, join(vendor, "pin-ui.mjs"));
  const pkgPath = join(dir, "package.json");
  const text = readFileSync(pkgPath, "utf8");
  const re = new RegExp(`("${PKG.replace("/", "\\/")}"\\s*:\\s*")[^"]*(")`);
  if (re.test(text)) writeFileSync(pkgPath, text.replace(re, `$1${depSpec(pin.tarball)}$2`));
  else {
    const pkg = JSON.parse(text);
    pkg.devDependencies = Object.fromEntries(Object.entries({ ...pkg.devDependencies, [PKG]: depSpec(pin.tarball) }).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }
}

function run(cmd, args, cwd, opts = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 1 << 26, stdio: opts.capture ? ["ignore", "pipe", "inherit"] : "inherit" });
  if (r.status !== 0) throw new Error(`pin-ui: ${cmd} ${args.join(" ")} failed in ${cwd} (${r.status ?? r.signal})`);
  return r.stdout ?? "";
}

/** Packs hackbuild-ui at a commit from git, built in a temp dir. Returns the tarball path and its pin. */
export function pack(home, ref) {
  const commit = run("git", ["rev-parse", "--verify", `${ref}^{commit}`], home, { capture: true }).trim();
  const version = JSON.parse(run("git", ["show", `${commit}:package.json`], home, { capture: true })).version;
  const tmp = mkdtempSync(join(tmpdir(), "pin-ui-"));
  const src = join(tmp, "src");
  mkdirSync(src);
  run("git", ["archive", "--format=tar", "-o", join(tmp, "src.tar"), commit], home);
  run("tar", ["-xf", join(tmp, "src.tar"), "-C", src], home);
  // the checkout's node_modules serves when the commit has the same lockfile; otherwise a clean install
  const lockAt = run("git", ["show", `${commit}:package-lock.json`], home, { capture: true });
  const lockHere = existsSync(join(home, "package-lock.json")) ? readFileSync(join(home, "package-lock.json"), "utf8") : "";
  if (lockAt === lockHere && existsSync(join(home, "node_modules"))) symlinkSync(join(home, "node_modules"), join(src, "node_modules"), "dir");
  else run("npx", [...NPM, "ci", "--ignore-scripts"], src);
  run("npx", [...NPM, "run", "build"], src);
  const out = join(tmp, "out");
  mkdirSync(out);
  const [info] = JSON.parse(run("npx", [...NPM, "pack", "--ignore-scripts", "--json", "--pack-destination", out], src, { capture: true }));
  const tarball = tarballName(version, commit);
  const tgzPath = join(tmp, tarball);
  copyFileSync(join(out, info.filename), tgzPath);
  const sha256 = digest("sha256", readFileSync(tgzPath), "hex");
  return { tmp, tgzPath, pin: { version, commit, tarball, sha256 } };
}

function report(rows) {
  let bad = 0;
  for (const { name, pin, errors } of rows) {
    console.log(`pin-ui: ${name}: ${pin?.tarball ?? "no pin"}${errors.length ? "" : ", holds"}`);
    for (const e of errors) console.error(`pin-ui:   ${e}`);
    bad += errors.length;
  }
  return bad;
}

/** The consumer checkouts next to home: the required ones always, the optional ones when present. */
function consumers(home) {
  const base = dirname(home);
  for (const c of CONSUMERS) if (!existsSync(join(base, c, "package.json"))) throw new Error(`pin-ui: consumer ${c} is not at ${join(base, c)}`);
  return [...CONSUMERS, ...OPTIONAL.filter((c) => existsSync(join(base, c, "package.json")))].map((c) => ({ name: c, dir: join(base, c) }));
}

function checkAll(home, script) {
  const rows = consumers(home).map(({ name, dir }) => {
    const r = checkRepo(dir);
    const copy = join(dir, VENDOR, "pin-ui.mjs");
    if (!existsSync(copy) || !readFileSync(copy).equals(readFileSync(script))) r.errors.push(`${VENDOR}/pin-ui.mjs differs from hackbuild-ui tools/pin-ui.mjs`);
    return { name, ...r };
  });
  let bad = report(rows);
  if (!samePin(rows.map((r) => r.pin))) {
    console.error(`pin-ui: the consumers are on different pins: ${rows.map((r) => `${r.name} ${r.pin?.tarball}`).join(", ")}`);
    bad++;
  }
  return bad;
}

function main(argv) {
  const script = fileURLToPath(import.meta.url);
  let root = dirname(script);
  while (!existsSync(join(root, "package.json"))) {
    if (dirname(root) === root) throw new Error("pin-ui: no package.json above the script");
    root = dirname(root);
  }
  const atHome = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).name === PKG;
  const args = argv.filter((a) => !a.startsWith("--"));
  if (argv.includes("--check")) {
    const bad = atHome ? checkAll(root, script) : report([{ name: basename(root), ...checkRepo(root) }]);
    process.exit(bad ? 1 : 0);
  }
  if (!atHome || args.length > 1 || argv.some((a) => a.startsWith("--"))) {
    console.error("usage: node tools/pin-ui.mjs [commit]   in hackbuild-ui\n       node tools/pin-ui.mjs --check | node tools/vendor/pin-ui.mjs --check");
    process.exit(2);
  }
  const list = consumers(root);
  const { tmp, tgzPath, pin } = pack(root, args[0] ?? "main");
  console.log(`pin-ui: packed ${pin.tarball} sha256 ${pin.sha256}`);
  try {
    for (const { name, dir } of list) {
      writePin(dir, tgzPath, pin, script);
      console.log(`pin-ui: ${name}: installing`);
      run("npx", [...NPM, "install"], dir);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  process.exit(checkAll(root, script) ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main(process.argv.slice(2));
