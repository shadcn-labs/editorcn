import { existsSync, readdirSync } from "node:fs";
import { posix, resolve } from "node:path";

import {
  bases,
  defaultBase,
  iconPlaceholderModule,
  registryUrl,
  styleName,
} from "./config.ts";
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
import type { Base, Catalog, RegistryItem, RegistryType } from "./types.ts";

const itemSchema = "https://ui.shadcn.com/schema/registry-item.json";
const shadcnName = /^[a-z0-9-]+$/;
const registryItemUrl = /\/([a-z0-9-]+)\.json$/;

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
    if (posix.basename(specifier) === iconPlaceholderModule) {
      return;
    }
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
  items: Map<string, RegistryItem>,
  style?: string
) => {
  const name = registryItemUrl.exec(dependency)?.[1];
  if (dependency.startsWith("https://")) {
    return name && items.has(name) && dependency === registryUrl(name, style)
      ? undefined
      : `registry dependency ${dependency} does not exist`;
  }
  return shadcnName.test(dependency)
    ? undefined
    : `registry dependency "${dependency}" is not a shadcn item name`;
};

const iconLibraries = [
  "lucide",
  "tabler",
  "hugeicons",
  "phosphor",
  "remixicon",
];

const checkIconPlaceholders = (
  file: string,
  item: RegistryItem,
  errors: string[]
) => {
  for (const entry of item.files) {
    if (
      posix.basename(entry.path, posix.extname(entry.path)) ===
      iconPlaceholderModule
    ) {
      errors.push(
        `${file}: ${entry.path} must not ship, the shadcn CLI replaces IconPlaceholder`
      );
    }
    for (const [element] of entry.content.matchAll(
      /<IconPlaceholder\b[^>]*>/g
    )) {
      if (!element.endsWith("/>")) {
        errors.push(
          `${file}: ${entry.path} has an IconPlaceholder that is not self-closing`
        );
        continue;
      }
      const missing = iconLibraries.filter(
        (library) => !new RegExp(`\\s${library}="[^"]+"`).test(element)
      );
      if (missing.length > 0) {
        errors.push(
          `${file}: ${entry.path} has an IconPlaceholder without ${missing.join(", ")}`
        );
      }
    }
  }
};

const checkImports = (
  file: string,
  item: RegistryItem,
  items: Map<string, RegistryItem>,
  errors: string[],
  style?: string
) => {
  const registryDependencies = item.registryDependencies ?? [];
  const reachable = [
    item,
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
      checkRegistryDependency(dependency, items, style)
    ),
  ];
  for (const problem of new Set(problems)) {
    if (problem) {
      errors.push(`${file}: ${problem}`);
    }
  }
};

const ownAnimation = /\banimate-((?:rte|block-editor|ext)-[a-z0-9-]+)/g;

const checkAnimations = (
  file: string,
  item: RegistryItem,
  items: Map<string, RegistryItem>,
  errors: string[]
) => {
  const provided = new Set(
    [
      item,
      ...(item.registryDependencies ?? []).flatMap((dependency) => {
        const target = items.get(registryItemUrl.exec(dependency)?.[1] ?? "");
        return target ? [target] : [];
      }),
    ].flatMap((entry) => Object.keys(entry.cssVars?.theme ?? {}))
  );
  for (const entry of item.files) {
    const used = new Set(
      [...entry.content.matchAll(ownAnimation)].map((match) => match[1])
    );
    for (const name of used) {
      if (!provided.has(`animate-${name}`)) {
        errors.push(
          `${file}: ${entry.path} uses animate-${name}, but neither this item nor its registry dependencies define --animate-${name}`
        );
      }
    }
  }
  for (const key of Object.keys(item.css ?? {})) {
    if (!/^@(keyframes|property) /.test(key)) {
      errors.push(`${file}: unexpected css rule "${key}"`);
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

const checkBasePackages = (
  file: string,
  item: RegistryItem,
  base: Base,
  errors: string[]
) => {
  const others = bases.filter((other) => other !== base);
  for (const entry of item.dependencies) {
    const { name } = parseDependency(entry);
    const owner = others.find((other) =>
      other.packages.some((pattern) => pattern.test(name))
    );
    if (owner) {
      errors.push(
        `${file}: depends on ${name} from ${owner.label}, but this is the ${base.label} build`
      );
    }
  }
};

const verifyDir = (dir: string, label: string, base: Base, style?: string) => {
  const errors: string[] = [];
  const items = new Map<string, RegistryItem>();
  for (const file of itemNames(dir)) {
    const item = readJson<RegistryItem>(resolve(dir, file), errors);
    if (item && checkShape(file, item, errors)) {
      items.set(item.name, item);
    }
  }
  if (items.size === 0) {
    errors.push(`${dir} has no valid registry items`);
  }
  for (const [name, item] of items) {
    checkImports(`${name}.json`, item, items, errors, style);
    checkIconPlaceholders(`${name}.json`, item, errors);
    checkAnimations(`${name}.json`, item, items, errors);
    checkBasePackages(`${name}.json`, item, base, errors);
  }
  checkCatalog(dir, items, errors);
  return errors.map((error) => `${label}${error}`);
};

const checkBases = (outDir: string, errors: string[]) => {
  const stylesDir = resolve(outDir, "styles");
  const expected = bases.map(styleName).toSorted();
  const found = existsSync(stylesDir)
    ? readdirSync(stylesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map(({ name }) => name)
        .toSorted()
    : [];
  if (found.join(",") !== expected.join(",")) {
    errors.push(
      `styles/ has ${found.join(", ") || "no styles"}, expected ${expected.join(", ")}`
    );
  }
  const root = itemNames(outDir).join(",");
  for (const style of found) {
    if (itemNames(resolve(stylesDir, style)).join(",") !== root) {
      errors.push(`styles/${style} does not ship the same items as r/`);
    }
  }
};

export const verify = (outDir: string) => {
  const errors: string[] = [];
  const fallback = bases.find(({ name }) => name === defaultBase);
  if (!fallback) {
    return [`defaultBase "${defaultBase}" is not in bases`];
  }
  errors.push(...verifyDir(outDir, "", fallback));
  for (const base of bases) {
    const style = styleName(base);
    errors.push(
      ...verifyDir(
        resolve(outDir, "styles", style),
        `styles/${style}/`,
        base,
        style
      )
    );
  }
  checkBases(outDir, errors);
  errors.push(...checkPrimitiveParity());
  return errors;
};
