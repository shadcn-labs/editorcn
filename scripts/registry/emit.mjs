import { homepage } from "./config.mjs";

const compareStrings = (a, b) => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

const comparePaths = (a, b) => {
  const left = a.split("/");
  const right = b.split("/");
  const depth = Math.min(left.length, right.length);
  for (let i = 0; i < depth; i += 1) {
    if (left[i] !== right[i]) {
      const leftIsFile = i === left.length - 1;
      const rightIsFile = i === right.length - 1;
      if (leftIsFile !== rightIsFile) {
        return leftIsFile ? -1 : 1;
      }
      if (leftIsFile) {
        const leftIsIndex = left[i].startsWith("index.");
        const rightIsIndex = right[i].startsWith("index.");
        if (leftIsIndex !== rightIsIndex) {
          return leftIsIndex ? -1 : 1;
        }
      }
      return compareStrings(left[i], right[i]);
    }
  }
  return left.length - right.length;
};

const isUrl = (value) => value.startsWith("https://");

const compareRegistryDependencies = (a, b) =>
  Number(isUrl(b)) - Number(isUrl(a)) || compareStrings(a, b);

const sortFiles = (files) =>
  files.toSorted((a, b) => comparePaths(a.path, b.path));

export const registryItem = (item) => {
  const output = {
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

export const registryCatalog = (items) => ({
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

export const serialize = (value) => JSON.stringify(value, null, 2);
