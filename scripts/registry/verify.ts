import { existsSync, readdirSync } from "node:fs";
import { posix, resolve } from "node:path";

import { registryUrl } from "./config.ts";
import {
  componentsPrefix,
  isPackageImport,
  isScaffold,
  packageName,
  parseDependency,
  shadcnPrefix,
} from "./dependencies.ts";
import { readText } from "./discover.ts";
import { isScript, resolveCandidates, scanImports } from "./imports.ts";
import { checkPrimitiveParity } from "./parity.ts";
import { workspacePrefix } from "./transform.ts";
import { registryTypes } from "./types.ts";
import type { Catalog, RegistryItem, RegistryType } from "./types.ts";

const itemSchema = "https://ui.shadcn.com/schema/registry-item.json";
const shadcnName = /^[a-z0-9-]+$/;
const registryItemUrl = /\/r\/([a-z0-9-]+)\.json$/;

const readJson = <T>(path: string, errors: string[]): T | undefined => {
  try {
    return JSON.parse(readText(path)) as T;
  } catch (error) {
    errors.push(`${posix.basename(path)}: invalid JSON (${String(error)})`);
  }
};

const checkShape = (file: string, item: RegistryItem, errors: string[]) => {
  const fail = (message: string) => errors.push(`${file}: ${message}`);
  if (item.$schema !== itemSchema) {
    fail(`$schema must be ${itemSchema}`);
  }
  for (const key of ["name", "title", "description"] as const) {
    if (typeof item[key] !== "string" || item[key] === "") {
      fail(`"${key}" must be a non-empty string`);
    }
  }
  if (`${item.name}.json` !== file) {
    fail(`name "${item.name}" does not match the file name`);
  }
  if (!registryTypes.includes(item.type)) {
    fail(`unknown type "${item.type}"`);
  }
  if (!Array.isArray(item.files) || item.files.length === 0) {
    fail("has no files");
    return false;
  }
  for (const entry of item.files) {
    if (!entry.content?.trim()) {
      fail(`${entry.path} is empty`);
    }
    if (entry.target !== `@components/${entry.path}`) {
      fail(`${entry.path} has target "${entry.target}"`);
    }
    if (!registryTypes.includes(entry.type as RegistryType)) {
      fail(`${entry.path} has unknown type "${entry.type}"`);
    }
  }
  return true;
};

const resolvesTo = (paths: Set<string>, base: string) =>
  resolveCandidates(base, posix.join).some((candidate) => paths.has(candidate));

interface ImportContext {
  declared: Set<string>;
  registryDependencies: string[];
  shipped: Set<string>;
}

const notShipped = (path: string, specifier: string) =>
  `${path} imports "${specifier}", which neither this item nor its registry dependencies ship`;

const checkComponentImport = (
  path: string,
  specifier: string,
  context: ImportContext
) => {
  const target = specifier.slice(componentsPrefix.length);
  if (!target.startsWith(shadcnPrefix)) {
    return resolvesTo(context.shipped, target)
      ? undefined
      : notShipped(path, specifier);
  }
  const name = target.slice(shadcnPrefix.length);
  return context.registryDependencies.includes(name)
    ? undefined
    : `${path} imports "${specifier}", but "${name}" is not in registryDependencies`;
};

const checkImport = (
  path: string,
  specifier: string,
  context: ImportContext
) => {
  if (specifier.startsWith(workspacePrefix)) {
    return `${path} imports the workspace path "${specifier}"`;
  }
  if (specifier.startsWith(".")) {
    const base = posix.join(posix.dirname(path), specifier);
    return resolvesTo(context.shipped, base)
      ? undefined
      : notShipped(path, specifier);
  }
  if (specifier.startsWith(componentsPrefix)) {
    return checkComponentImport(path, specifier, context);
  }
  if (specifier.startsWith("@/")) {
    return isScaffold(specifier)
      ? undefined
      : `${path} imports "${specifier}", which a shadcn project does not have`;
  }
  const name = packageName(specifier);
  if (
    isPackageImport(specifier) &&
    !isScaffold(name) &&
    !context.declared.has(name)
  ) {
    return `${path} imports "${name}", which is not in dependencies`;
  }
};

const checkRegistryDependency = (
  dependency: string,
  items: Map<string, RegistryItem>
) => {
  const name = registryItemUrl.exec(dependency)?.[1];
  if (dependency.startsWith("https://")) {
    return name && items.has(name) && dependency === registryUrl(name)
      ? undefined
      : `registry dependency ${dependency} does not exist`;
  }
  return shadcnName.test(dependency)
    ? undefined
    : `registry dependency "${dependency}" is not a shadcn item name`;
};

const checkImports = (
  file: string,
  item: RegistryItem,
  items: Map<string, RegistryItem>,
  overlays: Map<string, string>,
  errors: string[]
) => {
  const registryDependencies = item.registryDependencies ?? [];
  const overlaid = items.get(overlays.get(item.name) ?? "");
  const reachable = [
    item,
    ...(overlaid ? [overlaid] : []),
    ...registryDependencies.flatMap((dependency) => {
      const name = registryItemUrl.exec(dependency)?.[1];
      const target = name ? items.get(name) : undefined;
      return target ? [target] : [];
    }),
  ];
  const context: ImportContext = {
    declared: new Set(
      item.dependencies.map((entry) => parseDependency(entry).name)
    ),
    registryDependencies,
    shipped: new Set(
      reachable.flatMap((entry) => entry.files.map(({ path }) => path))
    ),
  };
  const problems = [
    ...item.files
      .filter(({ path }) => isScript(path))
      .flatMap((entry) =>
        scanImports(entry.content, entry.path).map(({ specifier }) =>
          checkImport(entry.path, specifier, context)
        )
      ),
    ...registryDependencies.map((dependency) =>
      checkRegistryDependency(dependency, items)
    ),
  ];
  for (const problem of new Set(problems)) {
    if (problem) {
      errors.push(`${file}: ${problem}`);
    }
  }
};

const checkCatalog = (
  outDir: string,
  items: Map<string, RegistryItem>,
  errors: string[]
) => {
  const catalog = readJson<Catalog>(resolve(outDir, "registry.json"), errors);
  if (!catalog) {
    return;
  }
  const listed = new Set(catalog.items.map(({ name }) => name));
  for (const name of items.keys()) {
    if (!listed.has(name)) {
      errors.push(`registry.json: ${name}.json exists but is not listed`);
    }
  }
  for (const entry of catalog.items) {
    const item = items.get(entry.name);
    if (!item) {
      errors.push(`registry.json: lists ${entry.name}, which has no item file`);
      continue;
    }
    const files = item.files.map(({ path, type }) => `${path} ${type}`);
    const listedFiles = entry.files.map(({ path, type }) => `${path} ${type}`);
    if (
      entry.title !== item.title ||
      entry.description !== item.description ||
      entry.type !== item.type ||
      entry.dependencies.join(",") !== item.dependencies.join(",") ||
      listedFiles.join(",") !== files.join(",")
    ) {
      errors.push(`registry.json: the ${entry.name} entry is out of date`);
    }
  }
};

const itemNames = (dir: string) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".json") && file !== "registry.json")
    .toSorted();

const checkBases = (outDir: string, errors: string[]) => {
  const stylesDir = resolve(outDir, "styles");
  if (!existsSync(stylesDir)) {
    return;
  }
  const styles = readdirSync(stylesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => ({ items: itemNames(resolve(stylesDir, name)), name }));
  const [first, ...rest] = styles;
  for (const style of rest) {
    if (first && style.items.join(",") !== first.items.join(",")) {
      errors.push(
        `styles/${style.name} and styles/${first.name} do not ship the same items`
      );
    }
  }
};

export const verify = (outDir: string, overlays: Map<string, string>) => {
  const errors: string[] = [];
  const items = new Map<string, RegistryItem>();
  for (const file of itemNames(outDir)) {
    const item = readJson<RegistryItem>(resolve(outDir, file), errors);
    if (item && checkShape(file, item, errors)) {
      items.set(item.name, item);
    }
  }
  if (items.size === 0) {
    errors.push(`${outDir} has no valid registry items`);
  }
  for (const [name, item] of items) {
    checkImports(`${name}.json`, item, items, overlays, errors);
  }
  checkCatalog(outDir, items, errors);
  checkBases(outDir, errors);
  errors.push(...checkPrimitiveParity());
  return errors;
};
