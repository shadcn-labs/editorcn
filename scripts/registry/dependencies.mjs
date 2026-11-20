import { ranges, registryUrl, scaffoldImports } from "./config.mjs";

const componentsPrefix = "@/components/";
const shadcnPrefix = "ui/";

const isScaffold = (specifier) =>
  scaffoldImports.some((pattern) => pattern.test(specifier));

const packageName = (specifier) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

const isPackageImport = (specifier) =>
  !specifier.startsWith(".") &&
  !specifier.startsWith("@/") &&
  !specifier.startsWith("node:");

const parseDependency = (entry) => {
  const at = entry.indexOf("@", 1);
  return at === -1
    ? { name: entry }
    : { name: entry.slice(0, at), range: entry.slice(at + 1) };
};

const defaultRange = (name) =>
  ranges[name] ??
  Object.entries(ranges).find(
    ([pattern]) =>
      pattern.endsWith("/*") && name.startsWith(pattern.slice(0, -1))
  )?.[1];

export const resolveDependencies = (item, specifiers) => {
  const names = new Set(
    specifiers
      .filter(isPackageImport)
      .map(packageName)
      .filter((name) => !isScaffold(name))
  );
  const declared = new Map();
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

const isUnder = (path, dir) => path === dir || path.startsWith(`${dir}/`);

export const resolveRegistryDependencies = (
  item,
  specifiers,
  items,
  sharedHomes
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
      (other) => other.home && isUnder(path, other.home)
    );
    if (path.startsWith(shadcnPrefix)) {
      dependencies.add(path.slice(shadcnPrefix.length));
    } else if (owner && owner !== item) {
      dependencies.add(registryUrl(owner.meta.name));
    } else if (!owner && !sharedHomes.some((home) => isUnder(path, home))) {
      throw new Error(
        `${item.meta.name}: "${specifier}" does not belong to any registry item.`
      );
    }
  }
  return [...dependencies];
};
