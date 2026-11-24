export const registryTypes = [
  "registry:block",
  "registry:component",
  "registry:lib",
  "registry:style",
] as const;

export type RegistryType = (typeof registryTypes)[number];

export interface Meta {
  name: string;
  type: RegistryType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  exclude?: string[];
  fileTypes?: Record<string, RegistryType>;
  iconSets?: { requiredExports?: string[] };
}

export interface SharedDir {
  dir: string;
  include: "all" | "imported";
}

export interface Source {
  dir: string;
  prefix: string;
  filesDir?: string;
  dependencies?: string[];
  shared?: SharedDir[];
}

export interface IconSet {
  file: string;
  name: string;
  title: string;
}

export type AliasTarget = string | Record<string, string>;

export interface ImportRef {
  specifier: string;
  start: number;
  end: number;
}

export interface SourceFile {
  path: string;
  source: string;
  type: RegistryType;
}

export interface CssRules {
  [key: string]: string | CssRules;
}

export interface ItemTheme {
  css: Record<string, CssRules>;
  theme: Record<string, string>;
}

export interface Item {
  files: SourceFile[];
  themeFiles: string[];
  meta: Meta;
  source: Pick<Source, "dependencies">;
  filesDir?: string;
  home?: string;
  iconVariant?: { base: string; requiredExports: string[] };
}

export interface BuiltFile extends SourceFile {
  content: string;
  specifiers: string[];
}

export interface BuiltItem extends Omit<Item, "files"> {
  files: BuiltFile[];
  dependencies: string[];
  registryDependencies: string[];
  theme: ItemTheme;
}

export interface RegistryFile {
  content: string;
  path: string;
  target: string;
  type: RegistryType;
}

export interface RegistryItem {
  $schema: string;
  dependencies: string[];
  description: string;
  files: RegistryFile[];
  name: string;
  title: string;
  type: RegistryType;
  registryDependencies?: string[];
  cssVars?: { theme: Record<string, string> };
  css?: Record<string, CssRules>;
}

export interface CatalogItem {
  dependencies: string[];
  description: string;
  files: Pick<RegistryFile, "path" | "type">[];
  name: string;
  title: string;
  type: RegistryType;
}

export interface Catalog {
  $schema: string;
  homepage: string;
  items: CatalogItem[];
  name: string;
}
