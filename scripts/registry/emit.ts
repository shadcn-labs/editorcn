import { homepage } from "./config.ts";
import type { BuiltItem, Catalog, RegistryItem } from "./types.ts";

const compareStrings = (a: string, b: string) => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

const comparePaths = (a: string, b: string) => {
  const left = a.split("/");
  const right = b.split("/");
  const depth = Math.min(left.length, right.length);
  for (let i = 0; i < depth; i += 1) {
    const leftPart = left[i] ?? "";
    const rightPart = right[i] ?? "";
    if (leftPart !== rightPart) {
      const leftIsFile = i === left.length - 1;
      const rightIsFile = i === right.length - 1;
      if (leftIsFile !== rightIsFile) {
        return leftIsFile ? -1 : 1;
      }
      if (leftIsFile) {
        const leftIsIndex = leftPart.startsWith("index.");
        const rightIsIndex = rightPart.startsWith("index.");
        if (leftIsIndex !== rightIsIndex) {
          return leftIsIndex ? -1 : 1;
        }
      }
      return compareStrings(leftPart, rightPart);
    }
  }
  return left.length - right.length;
};

const isUrl = (value: string) => value.startsWith("https://");

const compareRegistryDependencies = (a: string, b: string) =>
  Number(isUrl(b)) - Number(isUrl(a)) || compareStrings(a, b);

const sortFiles = <T extends { path: string }>(files: T[]) =>
  files.toSorted((a, b) => comparePaths(a.path, b.path));

export const registryItem = (item: BuiltItem): RegistryItem => {
  const output: RegistryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    dependencies: item.dependencies.toSorted(compareStrings),
    description: item.meta.description,
    files: sortFiles(item.files).map(({ content, path, type }) => ({
      content,
      path,
      target: `@components/${path}`,
      type,
    })),
    name: item.meta.name,
    title: item.meta.title,
    type: item.meta.type,
  };
  if (item.registryDependencies.length > 0) {
    output.registryDependencies = item.registryDependencies.toSorted(
      compareRegistryDependencies
    );
  }
  return output;
};

export const registryCatalog = (items: BuiltItem[]): Catalog => ({
  $schema: "https://ui.shadcn.com/schema/registry.json",
  homepage,
  items: items
    .map((item) => ({
      dependencies: item.dependencies.toSorted(compareStrings),
      description: item.meta.description,
      files: sortFiles(item.files).map(({ path, type }) => ({ path, type })),
      name: item.meta.name,
      title: item.meta.title,
      type: item.meta.type,
    }))
    .toSorted((a, b) => compareStrings(a.name, b.name)),
  name: "editorcn",
});

export const serialize = (value: unknown) => JSON.stringify(value, null, 2);
