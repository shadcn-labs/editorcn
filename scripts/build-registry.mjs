import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const __dirname = import.meta.dirname;
const root = resolve(__dirname, "..");

const read = (pkg, file) =>
  readFileSync(resolve(root, "packages", pkg, "src", file), "utf-8");

const packageVersion = (pkg) =>
  JSON.parse(
    readFileSync(resolve(root, "packages", pkg, "package.json"), "utf-8")
  ).version;

const TW_ANIMATE = "tw-animate-css@^1.4.0";
const ANIMATION_UTILITY = /\b(?:animate-in|animate-out|slide-in-from-|slide-out-to-|zoom-in-|zoom-out-|fade-in-|fade-out-)\b/;

const usesAnimationUtilities = (files) =>
  files.some((file) => ANIMATION_UTILITY.test(file.content));

const entry = (path, type, pkg, src) => {
  const target = `@components/${path}`;
  return { content: read(pkg, src), path, target, type };
};

const editorUiRoot = resolve(root, "packages", "editor-ui", "src");

const rewriteEditorUiImports = (content) =>
  content
    .replaceAll("@editorcn/editor-ui/components/", "@components/editor-ui/")
    .replaceAll("@editorcn/editor-ui/lib/", "@/lib/");

/*
 * Each ui set now lives in its own editor-ui folder and is copied into the
 * registry flattened, because a registry item is a flat file list and
 * "@editorcn/editor-ui/..." would not resolve in a consumer's project.
 *
 * `set` is the folder under editor-ui/src ("editor", "block-editor",
 * "extensions"); the emitted path keeps the set name so two sets can ship a
 * file with the same name without colliding.
 */
const collectUiSet = (set, name, out = new Map()) => {
  const key = `${set}/${name}`;
  if (out.has(key) || name === "utils") {
    return out;
  }
  const base = resolve(editorUiRoot, set, "ui", name);
  const file = existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`;
  if (!existsSync(file)) {
    throw new Error(`ui component "${key}" is imported but not found at ${file}`);
  }
  const content = readFileSync(file, "utf-8");
  for (const dep of content.matchAll(/from "\.\/([a-z-]+)"/g)) {
    collectUiSet(set, dep[1], out);
  }
  out.set(
    key,
    content.replaceAll(
      /from "\.\/([a-z-]+)"/g,
      (_m, dep) => `from "@components/${set}/ui/${dep}.tsx"`
    )
  );
  return out;
};

const appendUiSetDependencies = (files, set) => {
  const used = [
    ...new Set(
      files.flatMap((f) =>
        [
          ...f.content.matchAll(
            new RegExp(`@editorcn/editor-ui/${set}/ui/([a-z-]+)`, "g")
          ),
        ].map((match) => match[1])
      )
    ),
  ].filter((name) => name !== "utils");
  if (used.length === 0) {
    return files;
  }
  const collected = new Map();
  for (const name of used) {
    collectUiSet(set, name, collected);
  }
  for (const [key, content] of collected) {
    files.push({
      content,
      path: `${set}/ui/${key.split("/")[1]}.tsx`,
      target: `@components/${key}.tsx`,
      type: "registry:component",
    });
  }
  return files;
};

const appendEditorUiDependencies = (files, set) =>
  appendUiSetDependencies(files, set);

const editorFiles = [
  entry("editor/index.ts", "registry:component", "editor", "index.ts"),
  entry(
    "editor/rte-text-editor.tsx",
    "registry:component",
    "editor",
    "rte-text-editor.tsx"
  ),
  entry(
    "editor/rte-context.ts",
    "registry:component",
    "editor",
    "rte-context.ts"
  ),
  entry(
    "editor/rte-toolbar.tsx",
    "registry:component",
    "editor",
    "rte-toolbar.tsx"
  ),
  entry(
    "editor/rte-footer.tsx",
    "registry:component",
    "editor",
    "rte-footer.tsx"
  ),
  entry(
    "editor/rte-content.tsx",
    "registry:component",
    "editor",
    "rte-content.tsx"
  ),
  entry(
    "editor/rte-controls-group.tsx",
    "registry:component",
    "editor",
    "rte-controls-group.tsx"
  ),
  entry("editor/labels.ts", "registry:component", "editor", "labels.ts"),
  entry("editor/icons.tsx", "registry:component", "editor", "icons.tsx"),
  entry("editor/types.ts", "registry:component", "editor", "types.ts"),
  entry("editor/style.css", "registry:style", "editor", "style.css"),
  {
    content: readFileSync(
      resolve(editorUiRoot, "editor", "ui", "style.css"),
      "utf-8"
    ),
    path: "editor/ui/style.css",
    target: "@components/editor/ui/style.css",
    type: "registry:style",
  },
  entry(
    "editor/bubble-menu/index.tsx",
    "registry:component",
    "editor",
    "bubble-menu/index.tsx"
  ),
  entry(
    "editor/bubble-menu/utils.ts",
    "registry:component",
    "editor",
    "bubble-menu/utils.ts"
  ),
  entry(
    "editor/bubble-menu/language-selector.tsx",
    "registry:component",
    "editor",
    "bubble-menu/language-selector.tsx"
  ),
  entry(
    "editor/bubble-menu/color-selector.tsx",
    "registry:component",
    "editor",
    "bubble-menu/color-selector.tsx"
  ),
  entry(
    "editor/bubble-menu/text-buttons.tsx",
    "registry:component",
    "editor",
    "bubble-menu/text-buttons.tsx"
  ),
  {
    content: readFileSync(
      resolve(editorUiRoot, "editor", "ui", "rte-color-swatch.tsx"),
      "utf-8"
    ),
    path: "editor/ui/rte-color-swatch.tsx",
    target: "@components/editor/ui/rte-color-swatch.tsx",
    type: "registry:component",
  },
  entry(
    "editor/controls/rte-control.tsx",
    "registry:component",
    "editor",
    "controls/rte-control.tsx"
  ),
  entry(
    "editor/controls/rte-controls.tsx",
    "registry:component",
    "editor",
    "controls/rte-controls.tsx"
  ),
  entry(
    "editor/controls/rte-link-control.tsx",
    "registry:component",
    "editor",
    "controls/rte-link-control.tsx"
  ),
  entry(
    "editor/extensions/index.ts",
    "registry:component",
    "editor",
    "extensions/index.ts"
  ),
  entry(
    "editor/extensions/code-block.ts",
    "registry:component",
    "editor",
    "extensions/code-block.ts"
  ),
  entry(
    "editor/extensions/link.ts",
    "registry:component",
    "editor",
    "extensions/link.ts"
  ),
  entry(
    "editor/extensions/resizable-node-view.tsx",
    "registry:component",
    "editor",
    "extensions/resizable-node-view.tsx"
  ),
  entry(
    "editor/controls/rte-twitter-control.tsx",
    "registry:component",
    "editor",
    "controls/rte-twitter-control.tsx"
  ),
  entry(
    "editor/controls/rte-youtube-control.tsx",
    "registry:component",
    "editor",
    "controls/rte-youtube-control.tsx"
  ),
];

appendEditorUiDependencies(editorFiles, "editor");
for (const file of editorFiles) {
  file.content = rewriteEditorUiImports(file.content);
}

const blockEditorFiles = [
  entry(
    "block-editor/index.ts",
    "registry:component",
    "block-editor",
    "index.ts"
  ),
  entry(
    "block-editor/block-editor.tsx",
    "registry:component",
    "block-editor",
    "block-editor.tsx"
  ),
  entry(
    "block-editor/bubble-menu/index.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/index.tsx"
  ),
  entry(
    "block-editor/bubble-menu/utils.ts",
    "registry:component",
    "block-editor",
    "bubble-menu/utils.ts"
  ),
  entry(
    "block-editor/bubble-menu/node-selector.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/node-selector.tsx"
  ),
  entry(
    "block-editor/bubble-menu/text-buttons.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/text-buttons.tsx"
  ),
  entry(
    "block-editor/bubble-menu/align-selector.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/align-selector.tsx"
  ),
  entry(
    "block-editor/bubble-menu/link-selector.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/link-selector.tsx"
  ),
  entry(
    "block-editor/bubble-menu/language-selector.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/language-selector.tsx"
  ),
  entry(
    "block-editor/bubble-menu/color-selector.tsx",
    "registry:component",
    "block-editor",
    "bubble-menu/color-selector.tsx"
  ),
  {
    content: readFileSync(
      resolve(editorUiRoot, "block-editor", "ui", "color-swatch.tsx"),
      "utf-8"
    ),
    path: "block-editor/ui/color-swatch.tsx",
    target: "@components/block-editor/ui/color-swatch.tsx",
    type: "registry:component",
  },
  entry(
    "block-editor/context.tsx",
    "registry:component",
    "block-editor",
    "context.tsx"
  ),
  entry(
    "block-editor/icons.tsx",
    "registry:component",
    "block-editor",
    "icons.tsx"
  ),
  entry(
    "block-editor/labels.ts",
    "registry:component",
    "block-editor",
    "labels.ts"
  ),
  entry(
    "block-editor/types.ts",
    "registry:component",
    "block-editor",
    "types.ts"
  ),
  entry(
    "block-editor/style.css",
    "registry:style",
    "block-editor",
    "style.css"
  ),
  {
    content: readFileSync(
      resolve(editorUiRoot, "block-editor", "ui", "style.css"),
      "utf-8"
    ),
    path: "block-editor/ui/style.css",
    target: "@components/block-editor/ui/style.css",
    type: "registry:style",
  },
  entry(
    "block-editor/extensions/index.ts",
    "registry:component",
    "block-editor",
    "extensions/index.ts"
  ),
  entry(
    "block-editor/extensions/code-block.ts",
    "registry:component",
    "block-editor",
    "extensions/code-block.ts"
  ),
  entry(
    "block-editor/extensions/slash-command/index.ts",
    "registry:component",
    "block-editor",
    "extensions/slash-command/index.ts"
  ),
  entry(
    "block-editor/extensions/slash-command/slash-command.ts",
    "registry:component",
    "block-editor",
    "extensions/slash-command/slash-command.ts"
  ),
  entry(
    "block-editor/extensions/slash-command/suggestion.ts",
    "registry:component",
    "block-editor",
    "extensions/slash-command/suggestion.ts"
  ),
  entry(
    "block-editor/extensions/slash-command/suggestion-list.tsx",
    "registry:component",
    "block-editor",
    "extensions/slash-command/suggestion-list.tsx"
  ),
  entry(
    "block-editor/lib/utils.ts",
    "registry:lib",
    "block-editor",
    "lib/utils.ts"
  ),
  entry(
    "block-editor/lib/commands.ts",
    "registry:lib",
    "block-editor",
    "lib/commands.ts"
  ),
];

appendEditorUiDependencies(blockEditorFiles, "block-editor");
for (const file of blockEditorFiles) {
  file.content = rewriteEditorUiImports(file.content);
}

const staticRendererFiles = [
  entry(
    "static-renderer/index.ts",
    "registry:component",
    "static-renderer",
    "index.ts"
  ),
  entry(
    "static-renderer/static-renderer.tsx",
    "registry:component",
    "static-renderer",
    "static-renderer.tsx"
  ),
  entry(
    "static-renderer/lib/utils.ts",
    "registry:lib",
    "static-renderer",
    "lib/utils.ts"
  ),
  entry(
    "static-renderer/style.css",
    "registry:style",
    "static-renderer",
    "style.css"
  ),
];

const extensionCoreFiles = [
  "index.ts",
  "commands.ts",
  "context.tsx",
  "detection.ts",
  "editor-state.ts",
  "labels.ts",
  "types.ts",
].map((src) =>
  entry(
    `extensions/core/${src}`,
    "registry:component",
    "extensions",
    `core/${src}`
  )
);

const readUiComponent = (name) =>
  readFileSync(
    resolve(root, "packages", "ui", "src", "components", `${name}.tsx`),
    "utf-8"
  );

const collectUiComponents = (names, out = new Map()) => {
  for (const name of names) {
    if (out.has(name)) {
      continue;
    }
    const content = readUiComponent(name);
    const imported = [
      ...content.matchAll(/@editorcn\/ui\/components\/([a-z-]+)/g),
    ].map((match) => match[1]);
    collectUiComponents(imported, out);
    out.set(name, content.replaceAll("@editorcn/ui/lib/utils", "@/lib/utils"));
  }
  return out;
};

const extensionsBaseDeps = [
  "@tiptap/core@>=3.0.0 <4",
  "@tiptap/react@>=3.0.0 <4",
  "lucide-react@>=0.400.0 <1.0.0",
];

const extensionsManifest = JSON.parse(
  readFileSync(
    resolve(root, "packages", "extensions", "manifest.json"),
    "utf-8"
  )
);

const extensionsConfig = Object.entries(extensionsManifest).map(
  ([slug, meta]) => ({
    ...meta,
    name: slug,
  })
);

const rewriteExtensionsContent = (content) =>
  content
    .replaceAll("@editorcn/editor-ui/components/", "@components/editor-ui/")
    .replaceAll("@editorcn/editor-ui/lib/", "@/lib/")
    .replaceAll(
      /@editorcn\/editor-ui\/extensions\/ui\/(?:style\.css|([a-z-]+))/g,
      (_m, name) => (name ? `@components/extensions/ui/${name}.tsx` : "@/lib/utils")
    )
    .replaceAll("@editorcn/editor-ui/extensions/ui", "@components/extensions/ui/index.ts")
    .replaceAll("@editorcn/ui/components/", "@components/extensions/ui/")
    .replaceAll("@editorcn/ui/lib/", "@/lib/");

const extensionsUiDir = resolve(
  root,
  "packages",
  "editor-ui",
  "src",
  "extensions",
  "ui"
);

const extensionUiExists = (name) =>
  existsSync(resolve(extensionsUiDir, `${name}.tsx`));

const collectExtensionUi = (name, out = new Map()) => {
  if (out.has(name) || !extensionUiExists(name)) {
    return out;
  }
  const content = readFileSync(
    resolve(extensionsUiDir, `${name}.tsx`),
    "utf-8"
  );
  const imported = [...content.matchAll(/from "\.\/([a-z-]+)"/g)].map(
    (match) => match[1]
  );
  for (const dep of imported) {
    collectExtensionUi(dep, out);
  }
  out.set(name, content);
  return out;
};

const buildExtensionItem = (config) => {
  const sourceFiles = [
    config.extension,
    config.node,
    config.image,
    config.menu,
    config.theme,
    config.toolbar,
    config.overlay,
    config.actions,
  ].filter(Boolean);
  const entries = sourceFiles.map((file) =>
    entry(`extensions/${file}`, "registry:component", "extensions", file)
  );
  appendEditorUiDependencies(entries, "extensions");
  const legacyMatched = [
    ...new Set(
      entries.flatMap((e) =>
        [...e.content.matchAll(/@editorcn\/ui\/components\/([a-z-]+)/g)].map(
          (match) => match[1]
        )
      )
    ),
  ];
  const uiConfig = config.ui ?? [];
  const extensionsUi = new Map();
  for (const name of uiConfig) {
    if (extensionUiExists(name) && legacyMatched.includes(name) === false) {
      collectExtensionUi(name, extensionsUi);
    }
  }
  const extensionsUiEntries = [...extensionsUi].map(([name, content]) => ({
    content,
    path: `extensions/ui/${name}.tsx`,
    target: `@components/extensions/ui/${name}.tsx`,
    type: "registry:component",
  }));
  const legacyUiNames = [
    ...new Set([
      ...legacyMatched,
      ...uiConfig.filter((name) => !extensionUiExists(name)),
    ]),
  ];
  const legacyUiEntries = [...collectUiComponents(legacyUiNames)].map(
    ([name, content]) => ({
      content: rewriteExtensionsContent(content),
      path: `extensions/ui/${name}.tsx`,
      target: `@components/extensions/ui/${name}.tsx`,
      type: "registry:component",
    })
  );
  const styles = config.css ? [...new Set(config.css)] : [];
  if (
    extensionsUiEntries.length > 0 &&
    existsSync(resolve(extensionsUiDir, "style.css"))
  ) {
    styles.push("ui/style.css");
  }
  const styleEntries = styles.map((file) => {
    // The ui set's own stylesheet now lives in editor-ui, not beside the
    // extension; everything else is still the extension's own src.
    const source = file.startsWith("ui/")
      ? resolve(editorUiRoot, "extensions", "ui", file.slice(3))
      : resolve(root, "packages", "extensions", "src", file);
    return {
      content: readFileSync(source, "utf-8"),
      path: `extensions/${file}`,
      target: `@components/extensions/${file}`,
      type: "registry:style",
    };
  });
  const files = [
    ...extensionCoreFiles,
    ...entries,
    ...extensionsUiEntries,
    ...legacyUiEntries,
    ...styleEntries,
  ];
  for (const file of files) {
    file.content = rewriteExtensionsContent(file.content);
  }
  const editorUiDeps =
    entries.some((f) => f.content.includes("@editorcn/editor-ui")) ||
    entries.some((f) => f.content.includes("@components/editor-ui"))
      ? [
          "@base-ui/react@^1.0.0",
          "class-variance-authority@^0.7.1",
          "clsx@^2.1.1",
          "tailwind-merge@^3.0.0",
        ]
      : [];
  return {
    deps: [
      ...new Set([
        ...extensionsBaseDeps,
        ...editorUiDeps,
        ...(config.deps ?? []),
      ]),
    ],
    description: config.description,
    files,
    name: config.name,
    title: config.title,
  };
};

const extensionsItems = extensionsConfig.map(buildExtensionItem);

const deps = {
  "block-editor": [
    "@tiptap/react@>=2.11.5 <4",
    "@tiptap/pm@>=2.11.5 <4",
    "@tiptap/starter-kit@>=2.11.5 <4",
    "@tiptap/core@>=2.11.5 <4",
    "@tiptap/extension-link@>=2.11.5 <4",
    "@tiptap/extension-underline@>=2.11.5 <4",
    "@tiptap/extension-placeholder@>=2.11.5 <4",
    "@tiptap/extension-text-align@>=2.11.5 <4",
    "@tiptap/extension-task-list@>=2.11.5 <4",
    "@tiptap/extension-task-item@>=2.11.5 <4",
    "@tiptap/extension-image@>=2.11.5 <4",
    "@tiptap/extension-table@>=2.11.5 <4",
    "@tiptap/extension-table-row@>=2.11.5 <4",
    "@tiptap/extension-table-cell@>=2.11.5 <4",
    "@tiptap/extension-table-header@>=2.11.5 <4",
    "@tiptap/extension-drag-handle@>=2.11.5 <4",
    "@tiptap/extension-drag-handle-react@>=2.11.5 <4",
    "@tiptap/suggestion@>=2.11.5 <4",
    "@tiptap/extension-code-block-lowlight@>=2.11.5 <4",
    "@tiptap/extension-text-style@>=2.11.5 <4",
    "@tiptap/extension-color@>=2.11.5 <4",
    "@tiptap/extension-highlight@>=2.11.5 <4",
    "lowlight@>=3.0.0 <4",
    "@base-ui/react@^1.0.0",
    "@floating-ui/dom@^1.6.0",
    "class-variance-authority@^0.7.1",
    "clsx@^2.1.1",
    "lucide-react@>=0.400.0 <1.0.0",
    "tailwind-merge@^3.0.0",
  ],
  editor: [
    "@tiptap/core@>=2.11.5 <4",
    "@tiptap/react@>=2.11.5 <4",
    "@tiptap/pm@>=2.11.5 <4",
    "@tiptap/starter-kit@>=2.11.5 <4",
    "@tiptap/extension-link@>=2.11.5 <4",
    "@tiptap/extension-underline@>=2.11.5 <4",
    "@tiptap/extension-highlight@>=2.11.5 <4",
    "@tiptap/extension-text-align@>=2.11.5 <4",
    "@tiptap/extension-subscript@>=2.11.5 <4",
    "@tiptap/extension-superscript@>=2.11.5 <4",
    "@tiptap/extension-placeholder@>=2.11.5 <4",
    "@tiptap/extension-character-count@>=2.11.5 <4",
    "@tiptap/extension-text-style@>=2.11.5 <4",
    "@tiptap/extension-color@>=2.11.5 <4",
    "@tiptap/extension-code-block-lowlight@>=2.11.5 <4",
    "lowlight@>=3.0.0 <4",
    "@base-ui/react@^1.0.0",
    "class-variance-authority@^0.7.1",
    "clsx@^2.1.1",
    "lucide-react@>=0.400.0 <1.0.0",
    "tailwind-merge@^3.0.0",
  ],
  "static-renderer": [
    "@tiptap/core@>=3.21.0 <4",
    "@tiptap/pm@>=3.21.0 <4",
    "@tiptap/static-renderer@>=3.21.0 <4",
    "clsx@^2.1.1",
    "tailwind-merge@^3.0.0",
  ],
};

const buildItem = (
  name,
  title,
  desc,
  files,
  dependencies,
  registryDependencies,
  sourcePackage
) => {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    dependencies: usesAnimationUtilities(files)
      ? [...new Set([...dependencies, TW_ANIMATE])]
      : dependencies,
    description: desc,
    files,
    meta: { version: packageVersion(sourcePackage) },
    name,
    title,
    type: "registry:component",
  };
  if (registryDependencies) {
    item.registryDependencies = registryDependencies;
  }
  return item;
};

const catalogItem = (name, title, desc, depsList, fileList, sourcePackage) => ({
  dependencies: depsList,
  description: desc,
  files: fileList.map((f) => ({ path: f.path, type: f.type })),
  meta: { version: packageVersion(sourcePackage) },
  name,
  title,
  type: "registry:component",
});

const outDir = resolve(root, "apps", "web", "public", "r");
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

writeFileSync(
  resolve(outDir, "editor.json"),
  JSON.stringify(
    buildItem(
      "editor",
      "Rich Text Editor",
      "A toolbar-style rich text editor built on Tiptap with shadcn/ui tokens.",
      editorFiles,
      deps.editor,
      undefined,
      "editor"
    ),
    null,
    2
  )
);
writeFileSync(
  resolve(outDir, "block-editor.json"),
  JSON.stringify(
    buildItem(
      "block-editor",
      "Block Editor",
      "A Notion-style block editor built on Tiptap with shadcn/ui tokens.",
      blockEditorFiles,
      deps["block-editor"],
      undefined,
      "block-editor"
    ),
    null,
    2
  )
);
writeFileSync(
  resolve(outDir, "static-renderer.json"),
  JSON.stringify(
    buildItem(
      "static-renderer",
      "Static Renderer",
      "Read-only rendering and styling for HTML produced by editor and block-editor.",
      staticRendererFiles,
      deps["static-renderer"],
      undefined,
      "static-renderer"
    ),
    null,
    2
  )
);

for (const item of extensionsItems) {
  writeFileSync(
    resolve(outDir, `${item.name}.json`),
    JSON.stringify(
      buildItem(
        item.name,
        item.title,
        item.description,
        item.files,
        item.deps,
        undefined,
        "extensions"
      ),
      null,
      2
    )
  );
}

const catalog = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  homepage: "https://editorcn.vercel.app",
  items: [
    catalogItem(
      "editor",
      "Rich Text Editor",
      "A toolbar-style rich text editor built on Tiptap with shadcn/ui tokens.",
      deps.editor,
      editorFiles,
      "editor"
    ),
    catalogItem(
      "block-editor",
      "Block Editor",
      "A Notion-style block editor built on Tiptap with shadcn/ui tokens.",
      deps["block-editor"],
      blockEditorFiles,
      "block-editor"
    ),
    catalogItem(
      "static-renderer",
      "Static Renderer",
      "Read-only rendering and styling for HTML produced by editor and block-editor.",
      deps["static-renderer"],
      staticRendererFiles,
      "static-renderer"
    ),
    ...extensionsItems.map((item) =>
      catalogItem(
        item.name,
        item.title,
        item.description,
        item.deps,
        item.files,
        "extensions"
      )
    ),
  ],
  name: "editorcn",
};
writeFileSync(
  resolve(outDir, "registry.json"),
  JSON.stringify(catalog, null, 2)
);

console.log("Built registry:");
console.log("  apps/web/public/r/registry.json");
console.log("  apps/web/public/r/editor.json");
console.log("  apps/web/public/r/block-editor.json");
console.log("  apps/web/public/r/static-renderer.json");
for (const item of extensionsItems) {
  console.log(`  apps/web/public/r/${item.name}.json`);
}
