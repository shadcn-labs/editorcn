import { mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import {
  resolveDependencies,
  resolveRegistryDependencies,
} from "./registry/dependencies.mjs";
import { discover, readText, root, sharedHomes } from "./registry/discover.mjs";
import { registryCatalog, registryItem, serialize } from "./registry/emit.mjs";
import { isScript, scanImports } from "./registry/imports.mjs";
import { transform } from "./registry/transform.mjs";

const checkIconVariant = (item, content, specifiers) => {
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
  for (const exported of item.iconVariant.requiredExports) {
    if (!new RegExp(`export (const|function) ${exported}\\b`).test(content)) {
      throw new Error(`${name}: icons.tsx must export ${exported}.`);
    }
  }
};

const discovered = discover();

const items = discovered.map((item) => {
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
});

const outDir = resolve(root, "apps", "web", "public", "r");
mkdirSync(outDir, { recursive: true });

for (const item of items) {
  writeFileSync(
    resolve(outDir, `${item.meta.name}.json`),
    serialize(registryItem(item))
  );
}
writeFileSync(
  resolve(outDir, "registry.json"),
  serialize(registryCatalog(items))
);

console.log(`Built ${items.length} registry items into apps/web/public/r`);
