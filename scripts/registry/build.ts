import { mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { outDir } from "./config.ts";
import {
  resolveDependencies,
  resolveRegistryDependencies,
} from "./dependencies.ts";
import { discover, readText, root, sharedHomes } from "./discover.ts";
import { registryCatalog, registryItem, serialize } from "./emit.ts";
import { isScript, scanImports } from "./imports.ts";
import { transform } from "./transform.ts";
import type { BuiltItem, Item } from "./types.ts";
import { verify } from "./verify.ts";

const checkIconVariant = (
  item: Item,
  content: string,
  specifiers: string[]
) => {
  const { name } = item.meta;
  if (specifiers.includes("./icons")) {
    throw new Error(
      `${name}: icons.tsx imports "./icons", which it overwrites. Import the icon types from "./icon-types" instead.`
    );
  }
  if (!specifiers.includes("./icon-types")) {
    throw new Error(
      `${name}: icons.tsx should take its types from "./icon-types".`
    );
  }
  for (const exported of item.iconVariant?.requiredExports ?? []) {
    if (!new RegExp(`export (const|function) ${exported}\\b`).test(content)) {
      throw new Error(`${name}: icons.tsx must export ${exported}.`);
    }
  }
};

const build = (item: Item, discovered: Item[]): BuiltItem => {
  const files = item.files.map((file) => {
    const label = relative(root, file.source);
    const content = transform(readText(file.source), label);
    const specifiers = isScript(file.source)
      ? scanImports(content, label).map(({ specifier }) => specifier)
      : [];
    if (item.iconVariant) {
      checkIconVariant(item, content, specifiers);
    }
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
      sharedHomes
    ),
  };
};

const discovered = discover();
const items = discovered.map((item) => build(item, discovered));

const target = resolve(root, outDir);
mkdirSync(target, { recursive: true });
for (const item of items) {
  writeFileSync(
    resolve(target, `${item.meta.name}.json`),
    serialize(registryItem(item))
  );
}
writeFileSync(
  resolve(target, "registry.json"),
  serialize(registryCatalog(items))
);

const overlays = new Map(
  items.flatMap((item) =>
    item.iconVariant ? [[item.meta.name, item.iconVariant.base] as const] : []
  )
);
const errors = verify(target, overlays);
if (errors.length > 0) {
  console.error(`Registry verification failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`Built and verified ${items.length} registry items in ${outDir}`);
