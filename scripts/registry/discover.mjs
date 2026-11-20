import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";

import { iconSets, ignoredFiles, sources } from "./config.mjs";
import { isScript, resolveRelative, scanImports } from "./imports.mjs";

export const root = resolve(import.meta.dirname, "..", "..");

export const readText = (path) =>
  readFileSync(path, "utf-8").replaceAll("\r\n", "\n");

const toPosix = (path) => path.split(sep).join("/");

const isInside = (dir, path) => {
  const rel = relative(dir, path);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
};

const escapeRegExp = (value) => value.replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&");

const globToRegExp = (glob) =>
  new RegExp(`^${glob.split("*").map(escapeRegExp).join("[^/]*")}$`);

const walk = (dir, isExcluded = () => false, base = dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => !ignoredFiles.some((pattern) => pattern.test(entry.name))
    )
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (isExcluded(toPosix(relative(base, path)))) {
        return [];
      }
      return entry.isDirectory() ? walk(path, isExcluded, base) : [path];
    });

const fileType = (rel, meta) => {
  if (meta.fileTypes?.[rel]) {
    return meta.fileTypes[rel];
  }
  if (rel.endsWith(".css")) {
    return "registry:style";
  }
  if (rel.split("/").includes("lib")) {
    return "registry:lib";
  }
  return meta.type;
};

const relativeImports = (path) =>
  isScript(path)
    ? scanImports(readText(path), path)
        .map(({ specifier }) => specifier)
        .filter((specifier) => specifier.startsWith("."))
        .map((specifier) => resolveRelative(path, specifier))
    : [];

const sharedFiles = (source, ownFiles, itemName) => {
  const groupDir = resolve(root, source.dir);
  const shared = (source.shared ?? []).map((entry) => ({
    ...entry,
    path: resolve(groupDir, entry.dir),
  }));
  const included = new Set(
    shared
      .filter((entry) => entry.include === "all")
      .flatMap((entry) => walk(entry.path))
  );
  const pending = [...ownFiles, ...included];
  while (pending.length > 0) {
    const from = pending.pop();
    for (const target of relativeImports(from)) {
      const owner = shared.find((entry) => isInside(entry.path, target));
      if (owner && !included.has(target)) {
        included.add(target);
        pending.push(target);
      } else if (!owner && !ownFiles.includes(target)) {
        throw new Error(
          `${itemName}: ${toPosix(relative(root, from))} imports ${toPosix(relative(root, target))}, which is outside the item. Import it through its registry item instead.`
        );
      }
    }
  }
  for (const entry of shared.filter(({ include }) => include === "imported")) {
    if ([...included].some((path) => isInside(entry.path, path))) {
      for (const path of walk(entry.path).filter((file) =>
        file.endsWith(".css")
      )) {
        included.add(path);
      }
    }
  }
  return [...included].map((path) => {
    const rel = toPosix(relative(groupDir, path));
    return {
      path: `${source.prefix}${rel}`,
      source: path,
      type: fileType(rel, { type: "registry:component" }),
    };
  });
};

const iconVariants = (item) =>
  iconSets.map((set) => ({
    files: [
      {
        path: `${item.home}/icons.tsx`,
        source: join(item.filesDir, set.file),
        type: "registry:component",
      },
    ],
    iconVariant: { requiredExports: item.meta.iconSets.requiredExports ?? [] },
    meta: {
      description: `${set.title} variant of the ${item.meta.title} icons. Install after the ${item.meta.name} item; overwrites ${item.home}/icons.tsx.`,
      name: `${item.meta.name}-icons-${set.name}`,
      title: `${item.meta.title} (${set.title})`,
      type: "registry:component",
    },
    source: {},
  }));

const readItem = (source, dir) => {
  const meta = JSON.parse(readText(join(dir, "meta.json")));
  if (meta.name !== basename(dir)) {
    throw new Error(
      `${toPosix(relative(root, dir))}/meta.json: name "${meta.name}" must match the folder name`
    );
  }
  const filesDir = source.filesDir ? join(dir, source.filesDir) : dir;
  const excluded = [
    ...(meta.exclude ?? []),
    ...(meta.iconSets ? iconSets.map((set) => set.file) : []),
  ].map(globToRegExp);
  const ownFiles = walk(filesDir, (rel) =>
    excluded.some((pattern) => pattern.test(rel))
  );
  const home = `${source.prefix}${meta.name}`;
  const item = {
    files: [
      ...ownFiles.map((path) => {
        const rel = toPosix(relative(filesDir, path));
        return {
          path: `${home}/${rel}`,
          source: path,
          type: fileType(rel, meta),
        };
      }),
      ...sharedFiles(source, ownFiles, meta.name),
    ],
    filesDir,
    home,
    meta,
    source,
  };
  return meta.iconSets ? [item, ...iconVariants(item)] : [item];
};

export const sharedHomes = sources.flatMap((source) =>
  (source.shared ?? []).map((entry) => `${source.prefix}${entry.dir}`)
);

export const discover = () =>
  sources.flatMap((source) => {
    const dir = resolve(root, source.dir);
    return readdirSync(dir, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() && existsSync(join(dir, entry.name, "meta.json"))
      )
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .flatMap((entry) => readItem(source, join(dir, entry.name)));
  });
