import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const __dirname = import.meta.dirname;
const root = resolve(__dirname, "..");

const SYNTAX_START = "/* editor-syntax:start */";
const SYNTAX_END = "/* editor-syntax:end */";
const MOTION_START = "/* editor-motion:start */";
const MOTION_END = "/* editor-motion:end */";

const CONTENT_ROOT = "__CONTENT_ROOT__";

// Every stylesheet that ships code blocks, and so needs the syntax theme.
const syntaxTargets = [
  { contentRoot: ".rte-content", path: "packages/editor/src/style.css" },
  {
    contentRoot: ".block-editor-content",
    path: "packages/block-editor/src/style.css",
  },
];

// Every stylesheet that ships a component with a tw-animate-css utility, and
// so needs the motion tokens those components read.
const motionTargets = [
  "packages/editor/src/style.css",
  "packages/block-editor/src/style.css",
  "packages/extensions/src/image-placeholder/style.css",
  "packages/extensions/src/table/style.css",
];

const read = (relativePath) =>
  readFileSync(resolve(root, relativePath), "utf-8");

const detectEol = (text) => (text.includes("\r\n") ? "\r\n" : "\n");

const toEol = (text, eol) => text.split(/\r?\n/).join(eol);

const replaceRegion = (text, start, end, body) => {
  const from = text.indexOf(start);
  const to = text.indexOf(end);
  if (from === -1 || to === -1 || to < from) {
    throw new Error(
      `markers ${start} / ${end} not found; run the bootstrap before syncing`
    );
  }
  return text.slice(0, from + start.length) + body + text.slice(to);
};

const syntax = read("packages/editor-ui/src/styles/syntax-highlighting.css");
const motion = read("packages/editor-ui/src/styles/motion.css");

let changed = 0;

for (const { contentRoot, path } of syntaxTargets) {
  if (!existsSync(resolve(root, path))) {
    continue;
  }
  const original = read(path);
  const eol = detectEol(original);
  const body = toEol(
    syntax.replaceAll(new RegExp(CONTENT_ROOT, "g"), contentRoot).trimEnd(),
    eol
  );
  const next = replaceRegion(
    original,
    SYNTAX_START,
    SYNTAX_END,
    eol + body + eol
  );
  if (next !== original) {
    writeFileSync(resolve(root, path), next, "utf-8");
    changed += 1;
    console.log(`  updated syntax theme in ${path}`);
  }
}

for (const path of motionTargets) {
  if (!existsSync(resolve(root, path))) {
    console.log(`  skipped ${path} (not present)`);
    continue;
  }
  const original = read(path);
  const eol = detectEol(original);
  const body = toEol(motion.trimEnd(), eol);
  const next = replaceRegion(
    original,
    MOTION_START,
    MOTION_END,
    eol + body + eol
  );
  if (next !== original) {
    writeFileSync(resolve(root, path), next, "utf-8");
    changed += 1;
    console.log(`  injected motion tokens into ${path}`);
  }
}

console.log(
  changed === 0
    ? "Styles already in sync with the shared sources."
    : `Synced ${changed} stylesheet(s).`
);
