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

export const forBase = (item: Item, base: Base): Item => {
  const dir = variantDir(base);
  const primitives = item.files.filter(
    (file) => dirname(file.source) === baseDir
  );
  if (!dir || primitives.length === 0) {
    return item;
  }
  const twins = twinFiles(dir);
  const home = posix.dirname(primitives[0]?.path ?? "");
  const swapped = item.files.map((file): SourceFile => {
    const name = basename(file.source);
    return dirname(file.source) === baseDir && twins.includes(name)
      ? { ...file, location: file.source, source: join(dir, name) }
      : file;
  });
  const added = twins
    .filter((name) => !existsSync(join(baseDir, name)))
    .map(
      (name): SourceFile => ({
        location: join(baseDir, name),
        path: `${home}/${name}`,
        source: join(dir, name),
        type: item.meta.type,
      })
    );
  return { ...item, files: [...swapped, ...added] };
};

export const relocate = (content: string, file: SourceFile) => {
  const { location } = file;
  if (!(location && isScript(file.source))) {
    return content;
  }
  const dir = dirname(file.source);
  let output = content;
  const imports = scanImports(content, toPosix(relative(root, file.source)))
    .filter(({ specifier }) => specifier.startsWith("."))
    .toReversed();
  for (const { end, specifier, start } of imports) {
    const target = resolveRelative(file.source, specifier);
    const moved =
      dirname(target) === dir ? join(baseDir, basename(target)) : target;
    const path = toPosix(relative(dirname(location), moved)).replace(
      /\.tsx?$/,
      ""
    );
    const next = path.startsWith(".") ? path : `./${path}`;
    output = `${output.slice(0, start)}${next}${output.slice(end)}`;
  }
  return output;
};
