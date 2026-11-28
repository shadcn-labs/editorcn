import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, posix, relative, resolve } from "node:path";

import { ignoredFiles, primitivePairs } from "./config.ts";
import { root, toPosix } from "./discover.ts";
import { isScript, resolveRelative, scanImports } from "./imports.ts";
import type { Base, Item, SourceFile } from "./types.ts";

const baseDir = resolve(root, primitivePairs.base);

const variantDir = (base: Base) => {
  const dir = primitivePairs.variants[
    base.name as keyof typeof primitivePairs.variants
  ] as string | undefined;
  return dir ? resolve(root, dir) : undefined;
};

const twinFiles = (dir: string) =>
  readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        !ignoredFiles.some((pattern) => pattern.test(entry.name))
    )
    .map(({ name }) => name);

const publishDir = dirname(baseDir);

const published = (path: string) =>
  dirname(path) === baseDir ? join(publishDir, basename(path)) : path;

export const forBase = (item: Item, base: Base): Item => {
  const primitives = item.files.filter(
    (file) => dirname(file.source) === baseDir
  );
  if (primitives.length === 0) {
    return item;
  }
  const dir = variantDir(base);
  const twins = dir ? twinFiles(dir) : [];
  const home = posix.dirname(posix.dirname(primitives[0]?.path ?? ""));
  const files = item.files.map((file): SourceFile => {
    if (dirname(file.source) !== baseDir) {
      return file;
    }
    const name = basename(file.source);
    return {
      ...file,
      location: file.source,
      path: `${home}/${name}`,
      source: dir && twins.includes(name) ? join(dir, name) : file.source,
    };
  });
  const added = dir
    ? twins
        .filter((name) => !existsSync(join(baseDir, name)))
        .map(
          (name): SourceFile => ({
            location: join(baseDir, name),
            path: `${home}/${name}`,
            source: join(dir, name),
            type: item.meta.type,
          })
        )
    : [];
  return { ...item, files: [...files, ...added] };
};

export const relocate = (content: string, file: SourceFile) => {
  if (!isScript(file.source)) {
    return content;
  }
  const { location } = file;
  const dir = dirname(file.source);
  let output = content;
  const imports = scanImports(content, toPosix(relative(root, file.source)))
    .filter(({ specifier }) => specifier.startsWith("."))
    .toReversed();
  for (const { end, specifier, start } of imports) {
    const target = resolveRelative(file.source, specifier);
    const moved =
      location && dirname(target) === dir
        ? join(baseDir, basename(target))
        : target;
    if (!location && dirname(moved) !== baseDir) {
      continue;
    }
    const from = dirname(published(location ?? file.source));
    const path = toPosix(relative(from, published(moved))).replace(
      /\.tsx?$/,
      ""
    );
    const next = path.startsWith(".") ? path : `./${path}`;
    output = `${output.slice(0, start)}${next}${output.slice(end)}`;
  }
  return output;
};
