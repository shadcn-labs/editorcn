import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  basename,
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  sep,
} from "node:path";

import { iconPlaceholderModule, ignoredFiles, sources } from "./config.ts";
import { isScript, resolveRelative, scanImports } from "./imports.ts";
import { registryTypes } from "./types.ts";
import type { Item, Meta, RegistryType, Source, SourceFile } from "./types.ts";

export const themeFile = "theme.css";

export const root = resolve(import.meta.dirname, "..", "..");

export const readText = (path: string) =>
  readFileSync(path, "utf-8").replaceAll("\r\n", "\n");

export const toPosix = (path: string) => path.split(sep).join("/");

const isInside = (dir: string, path: string) => {
  const rel = relative(dir, path);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
};

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&");

const globToRegExp = (glob: string) =>
  new RegExp(`^${glob.split("*").map(escapeRegExp).join("[^/]*")}$`);

const walk = (
  dir: string,
  isExcluded: (rel: string) => boolean = () => false,
  base = dir
): string[] =>
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

const fileType = (
  rel: string,
  meta: Pick<Meta, "fileTypes" | "type">
): RegistryType => {
  const override = meta.fileTypes?.[rel];
  if (override) {
    return override;
  }
  if (rel.endsWith(".css")) {
    return "registry:style";
  }
  if (rel.split("/").includes("lib")) {
    return "registry:lib";
  }
  return meta.type;
};

const relativeImports = (path: string) =>
  isScript(path)
    ? scanImports(readText(path), path)
        .map(({ specifier }) => specifier)
        .filter(
          (specifier) =>
            specifier.startsWith(".") &&
            posix.basename(specifier) !== iconPlaceholderModule
        )
        .map((specifier) => resolveRelative(path, specifier))
    : [];

const sharedFiles = (
  source: Source,
  ownFiles: string[],
  itemName: string
): SourceFile[] => {
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
  for (let from = pending.pop(); from; from = pending.pop()) {
    for (const target of relativeImports(from)) {
      const owner = shared.find((entry) => isInside(entry.path, target));
      if (owner && !included.has(target)) {
        included.add(target);
        pending.push(target);
      } else if (!(owner || ownFiles.includes(target))) {
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

const metaKeys = new Set([
  "dependencies",
  "description",
  "exclude",
  "fileTypes",
  "name",
  "registryDependencies",
  "title",
  "type",
]);

const parseMeta = (path: string): Meta => {
  const label = toPosix(relative(root, path));
  const meta = JSON.parse(readText(path)) as Record<string, unknown>;
  const unknown = Object.keys(meta).filter((key) => !metaKeys.has(key));
  if (unknown.length > 0) {
    throw new Error(`${label}: unknown field(s) ${unknown.join(", ")}`);
  }
  for (const key of ["name", "title", "description"]) {
    if (typeof meta[key] !== "string" || meta[key] === "") {
      throw new Error(`${label}: "${key}" must be a non-empty string`);
    }
  }
  if (!registryTypes.includes(meta.type as RegistryType)) {
    throw new Error(
      `${label}: "type" must be one of ${registryTypes.join(", ")}`
    );
  }
  return meta as unknown as Meta;
};

const readItem = (source: Source, dir: string): Item[] => {
  const meta = parseMeta(join(dir, "meta.json"));
  if (meta.name !== basename(dir)) {
    throw new Error(
      `${toPosix(relative(root, dir))}/meta.json: name "${meta.name}" must match the folder name`
    );
  }
  const filesDir = source.filesDir ? join(dir, source.filesDir) : dir;
  const excluded = (meta.exclude ?? []).map(globToRegExp);
  const ownFiles = walk(filesDir, (rel) =>
    excluded.some((pattern) => pattern.test(rel))
  );
  const home = `${source.prefix}${meta.name}`;
  const files = [
    ...ownFiles.map((path) => {
      const rel = toPosix(relative(filesDir, path));
      return {
        path: `${home}/${rel}`,
        source: path,
        type: fileType(rel, meta),
      };
    }),
    ...sharedFiles(source, ownFiles, meta.name),
  ];
  const isTheme = (file: SourceFile) => basename(file.source) === themeFile;
  const item = {
    files: files.filter((file) => !isTheme(file)),
    filesDir,
    home,
    meta,
    source,
    themeFiles: files.filter(isTheme).map((file) => file.source),
  };
  return [item];
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
