import { ranges, registryUrl, scaffoldImports } from "./config.ts";
import type { Item } from "./types.ts";

export const componentsPrefix = "@/components/";
export const shadcnPrefix = "ui/";

export const isScaffold = (specifier: string) =>
  scaffoldImports.some((pattern) => pattern.test(specifier));

export const packageName = (specifier: string) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

export const isPackageImport = (specifier: string) =>
  !specifier.startsWith(".") &&
  !specifier.startsWith("@/") &&
  !specifier.startsWith("node:");

export const parseDependency = (entry: string) => {
  const at = entry.indexOf("@", 1);
  return at === -1
    ? { name: entry }
    : { name: entry.slice(0, at), range: entry.slice(at + 1) };
};

const defaultRange = (name: string) =>
  ranges[name] ??
  Object.entries(ranges).find(
    ([pattern]) =>
      pattern.endsWith("/*") && name.startsWith(pattern.slice(0, -1))
  )?.[1];

export const resolveDependencies = (item: Item, specifiers: string[]) => {
  const names = new Set(
    specifiers
      .filter(isPackageImport)
      .map(packageName)
      .filter((name) => !isScaffold(name))
  );
  const declared = new Map<string, string>();
  for (const entry of [
    ...(item.source.dependencies ?? []),
    ...(item.meta.dependencies ?? []),
  ]) {
    const { name, range } = parseDependency(entry);
    names.add(name);
    if (range) {
      declared.set(name, range);
    }
  }
  return [...names].map((name) => {
    const range = declared.get(name) ?? defaultRange(name);
    if (!range) {
      throw new Error(
        `${item.meta.name}: no version range for "${name}". Add it to ranges in scripts/registry/config.mjs or to the item's meta.json.`
      );
    }
    return `${name}@${range}`;
  });
};

export const isUnder = (path: string, dir: string) =>
  path === dir || path.startsWith(`${dir}/`);

export const resolveRegistryDependencies = (
  item: Item,
  specifiers: string[],
  items: Item[],
  sharedHomes: string[],
  style?: string
) => {
  const dependencies = new Set(item.meta.registryDependencies);
  for (const specifier of specifiers) {
    if (!specifier.startsWith("@/") || isScaffold(specifier)) {
      continue;
    }
    if (!specifier.startsWith(componentsPrefix)) {
      throw new Error(
        `${item.meta.name}: "${specifier}" is not part of a shadcn project. Use @/components/... or @/lib/utils.`
      );
    }
    const path = specifier.slice(componentsPrefix.length);
    const owner = items.find(
      (other) => other.home !== undefined && isUnder(path, other.home)
    );
    if (path.startsWith(shadcnPrefix)) {
      dependencies.add(path.slice(shadcnPrefix.length));
    } else if (owner && owner !== item) {
      dependencies.add(registryUrl(owner.meta.name, style));
    } else if (!owner && !sharedHomes.some((home) => isUnder(path, home))) {
      throw new Error(
        `${item.meta.name}: "${specifier}" does not belong to any registry item.`
      );
    }
  }
  return [...dependencies];
};
