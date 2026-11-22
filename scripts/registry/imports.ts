import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

import ts from "typescript";

import type { ImportRef } from "./types.ts";

const scriptPattern = /\.[cm]?[jt]sx?$/;

export const isScript = (path: string) => scriptPattern.test(path);

export const scanImports = (content: string, path: string): ImportRef[] =>
  ts.preProcessFile(content, true, true).importedFiles.map((file) => {
    const start = file.pos + 1;
    const end = start + file.fileName.length;
    if (content.slice(start, end) !== file.fileName) {
      throw new Error(
        `${path}: could not locate the import "${file.fileName}"`
      );
    }
    return { end, specifier: file.fileName, start };
  });

export const resolveCandidates = (base: string, join = resolve) => [
  base,
  `${base}.ts`,
  `${base}.tsx`,
  join(base, "index.ts"),
  join(base, "index.tsx"),
];

export const resolveRelative = (from: string, specifier: string) => {
  const base = resolve(dirname(from), specifier);
  const match = resolveCandidates(base).find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile()
  );
  if (!match) {
    throw new Error(`${from}: cannot resolve "${specifier}"`);
  }
  return match;
};
