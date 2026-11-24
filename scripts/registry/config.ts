import type { AliasTarget, Base, IconSet, Source } from "./types.ts";

export const homepage = "https://www.rtecn.space";

export const bases: Base[] = [
  { label: "Base UI", name: "base", packages: [/^@base-ui\//] },
  {
    label: "Radix UI",
    name: "radix",
    packages: [/^radix-ui$/, /^@radix-ui\//],
  },
];

export const defaultBase = "base";

export const styleName = (base: Base) => `${base.name}-nova`;

export const registryUrl = (name: string, style?: string) =>
  style
    ? `${homepage}/r/styles/${style}/${name}.json`
    : `${homepage}/r/${name}.json`;

export const outDir = "apps/web/public/r";

export const sources: Source[] = [
  {
    dir: "packages",
    filesDir: "src",
    prefix: "",
  },
  {
    dependencies: ["@tiptap/core@>=3.30.5 <4", "@tiptap/react", "lucide-react"],
    dir: "packages/extensions/src",
    prefix: "extensions/",
    shared: [
      { dir: "core", include: "all" },
      { dir: "ui", include: "imported" },
    ],
  },
  {
    dir: "apps/web/src/components/templates",
    prefix: "templates/",
  },
];

export const ignoredFiles = [/^meta\.json$/, /\.test\.[jt]sx?$/, /^fixtures$/];

export const aliases: Record<string, AliasTarget> = {
  "@editorcn/block-editor": {
    "*": "@/components/block-editor/extensions",
    BlockEditor: "@/components/block-editor/block-editor",
  },
  "@editorcn/block-editor/*": "@/components/block-editor/*",
  "@editorcn/editor": "@/components/editor",
  "@editorcn/editor/*": "@/components/editor/*",
  "@editorcn/extensions/*": "@/components/extensions/*",
  "@editorcn/extensions/*-toolbar": "@/components/extensions/*/toolbar",
  "@editorcn/extensions/table-hover-overlay":
    "@/components/extensions/table/table-hover-overlay",
  "@editorcn/static-renderer": "@/components/static-renderer",
  "@editorcn/static-renderer/*": "@/components/static-renderer/*",
};

export const scaffoldImports = [
  /^react$/,
  /^react-dom$/,
  /^next$/,
  /^@types\//,
  /^@\/lib\/utils$/,
];

export const ranges: Record<string, string> = {
  "@base-ui/react": "^1.0.0",
  "@floating-ui/dom": "^1.6.0",
  "@hugeicons/core-free-icons": "^4.3.5",
  "@hugeicons/react": "^1.1.10",
  "@phosphor-icons/react": "^2.1.10",
  "@remixicon/react": "^4.9.0",
  "@tabler/icons-react": "^3.48.0",
  "@tiptap/*": ">=3.0.0 <4",
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "lucide-react": ">=0.400.0 <1.0.0",
  mermaid: "^11.0.0",
  prettier: "^3.0.0",
  "radix-ui": "^1.4.3",
  shiki: "^4.0.0",
  "tailwind-merge": "^3.0.0",
  xss: "^1.0.17",
};

export const iconSets: IconSet[] = [
  { file: "icons-phosphor.tsx", name: "phosphor", title: "Phosphor Icons" },
  { file: "icons-tabler.tsx", name: "tabler", title: "Tabler Icons" },
  { file: "icons-hugeicons.tsx", name: "hugeicons", title: "HugeIcons" },
  { file: "icons-remix.tsx", name: "remixicon", title: "Remix Icon" },
];

export const primitivePairs = {
  base: "packages/editor/src/ui",
  baseImport: /^@base-ui\//,
  variants: { radix: "packages/editor/src/ui/radix" },
};

export const stateSelectors: [RegExp, string][] = [
  [/data-\[state=open\]:/g, "data-open:"],
  [/data-\[state=closed\]:/g, "data-closed:"],
  [/--radix-[a-z-]+-transform-origin/g, "--transform-origin"],
];
