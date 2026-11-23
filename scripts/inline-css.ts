import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contentPrefix = "@editorcn/content/";
const importPattern = /^@import\s+["']([^"']+)["'];[ \t]*\n?/gm;

export const inlineCssImports = (css: string, label: string): string =>
  css.replaceAll(importPattern, (_statement, specifier: string) => {
    if (!specifier.startsWith(contentPrefix)) {
      throw new Error(
        `${label}: can't inline @import "${specifier}". Only ${contentPrefix}* is supported.`
      );
    }
    const path = resolve(
      root,
      "packages/content/src",
      specifier.slice(contentPrefix.length)
    );
    return `${readFileSync(path, "utf-8").replaceAll("\r\n", "\n").trimEnd()}\n`;
  });

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  const [from, to] = process.argv.slice(2);
  if (!(from && to)) {
    throw new Error("Usage: node scripts/inline-css.ts <from.css> <to.css>");
  }
  writeFileSync(to, inlineCssImports(readFileSync(from, "utf-8"), from));
}
