import { mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { forBase, relocate } from "./bases.ts";
import { bases, defaultBase, outDir, styleName } from "./config.ts";
import {
  resolveDependencies,
  resolveRegistryDependencies,
} from "./dependencies.ts";
import { discover, readText, root, sharedHomes } from "./discover.ts";
import { registryCatalog, registryItem, serialize } from "./emit.ts";
import { isScript, scanImports } from "./imports.ts";
import { mergeThemes, readTheme } from "./theme.ts";
import { transform } from "./transform.ts";
import type { BuiltItem, Item } from "./types.ts";
import { verify } from "./verify.ts";

const build = (item: Item, discovered: Item[], style?: string): BuiltItem => {
  const files = item.files.map((file) => {
    const label = relative(root, file.source);
    const content = transform(relocate(readText(file.source), file), label);
    const specifiers = isScript(file.source)
      ? scanImports(content, label).map(({ specifier }) => specifier)
      : [];
    return { ...file, content, specifiers };
  });
  const specifiers = files.flatMap((file) => file.specifiers);
  return {
    ...item,
    dependencies: resolveDependencies(item, specifiers),
    files,
    registryDependencies: resolveRegistryDependencies(
      item,
      specifiers,
      discovered,
      sharedHomes,
      style
    ),
    theme: mergeThemes(
      item.themeFiles.map((path) => readTheme(path, relative(root, path))),
      item.meta.name
    ),
  };
};

const write = (dir: string, items: BuiltItem[]) => {
  mkdirSync(dir, { recursive: true });
  for (const item of items) {
    writeFileSync(
      resolve(dir, `${item.meta.name}.json`),
      serialize(registryItem(item))
    );
  }
  writeFileSync(
    resolve(dir, "registry.json"),
    serialize(registryCatalog(items))
  );
};

const discovered = discover();
const target = resolve(root, outDir);

for (const base of bases) {
  const style = styleName(base);
  const variant = discovered.map((item) => forBase(item, base));
  write(
    resolve(target, "styles", style),
    variant.map((item) => build(item, variant, style))
  );
  if (base.name === defaultBase) {
    write(
      target,
      variant.map((item) => build(item, variant))
    );
  }
}
writeFileSync(
  resolve(target, "styles", "index.json"),
  serialize(bases.map((base) => ({ label: base.label, name: styleName(base) })))
);

const errors = verify(target);
if (errors.length > 0) {
  console.error(`Registry verification failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(
  `Built and verified ${discovered.length} registry items for ${bases.length} bases in ${outDir}`
);
