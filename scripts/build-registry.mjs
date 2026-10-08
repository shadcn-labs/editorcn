import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const __dirname = import.meta.dirname;
const root = resolve(__dirname, "..");

const readText = (path) => readFileSync(path, "utf-8").replaceAll("\r\n", "\n");

const read = (pkg, file) =>
  readText(resolve(root, "packages", pkg, "src", file), "utf-8");

const entry = (path, type, pkg, src) => {
  const target = `@components/${path}`;
  return { content: read(pkg, src), path, target, type };
};

const readTemplate = (file) =>
  readText(
    resolve(root, "apps", "web", "src", "components", "templates", file),
    "utf-8"
  )
    .replaceAll("@editorcn/editor", "@/components/editor")
    .replaceAll("@editorcn/static-renderer", "@/components/static-renderer")
    .replaceAll(
      "@editorcn/extensions/table-hover-overlay",
      "@/components/extensions/table/table-hover-overlay"
    )
    .replaceAll("@editorcn/extensions/", "@/components/extensions/");

const templateEntry = (name) =>
  readdirSync(
    resolve(root, "apps", "web", "src", "components", "templates", name)
  )
    .toSorted(
      (a, b) =>
        Number(b === "index.tsx") - Number(a === "index.tsx") ||
        a.localeCompare(b)
    )
    .map((file) => {
      const path = `templates/${name}/${file}`;
      return {
        content: readTemplate(`${name}/${file}`),
        path,
        target: `@components/${path}`,
        type: "registry:block",
      };
    });

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
  entry(
    "editor/icon-types.ts",
    "registry:component",
    "editor",
    "icon-types.ts"
  ),
  entry("editor/icons.tsx", "registry:component", "editor", "icons.tsx"),
  entry(
    "editor/language-icons.tsx",
    "registry:component",
    "editor",
    "language-icons.tsx"
  ),
  entry("editor/types.ts", "registry:component", "editor", "types.ts"),
  entry("editor/style.css", "registry:style", "editor", "style.css"),
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
  entry("editor/ui/utils.ts", "registry:lib", "editor", "ui/utils.ts"),
  entry(
    "editor/ui/button.tsx",
    "registry:component",
    "editor",
    "ui/button.tsx"
  ),
  entry(
    "editor/ui/toggle.tsx",
    "registry:component",
    "editor",
    "ui/toggle.tsx"
  ),
  entry(
    "editor/ui/popover.tsx",
    "registry:component",
    "editor",
    "ui/popover.tsx"
  ),
  entry("editor/ui/input.tsx", "registry:component", "editor", "ui/input.tsx"),
  entry(
    "editor/ui/dialog.tsx",
    "registry:component",
    "editor",
    "ui/dialog.tsx"
  ),
  entry("editor/ui/index.ts", "registry:component", "editor", "ui/index.ts"),
  entry(
    "editor/ui/rte-button.tsx",
    "registry:component",
    "editor",
    "ui/rte-button.tsx"
  ),
  entry(
    "editor/ui/rte-button-group.tsx",
    "registry:component",
    "editor",
    "ui/rte-button-group.tsx"
  ),
  entry(
    "editor/ui/rte-icon.tsx",
    "registry:component",
    "editor",
    "ui/rte-icon.tsx"
  ),
  entry(
    "editor/ui/rte-separator.tsx",
    "registry:component",
    "editor",
    "ui/rte-separator.tsx"
  ),
  entry(
    "editor/ui/rte-overlay.tsx",
    "registry:component",
    "editor",
    "ui/rte-overlay.tsx"
  ),
  entry(
    "editor/ui/rte-dropdown.tsx",
    "registry:component",
    "editor",
    "ui/rte-dropdown.tsx"
  ),
  entry(
    "editor/ui/rte-dropdown-item.tsx",
    "registry:component",
    "editor",
    "ui/rte-dropdown-item.tsx"
  ),
  entry(
    "editor/ui/rte-dropdown-divider.tsx",
    "registry:component",
    "editor",
    "ui/rte-dropdown-divider.tsx"
  ),
  entry(
    "editor/ui/rte-dropdown-icon.tsx",
    "registry:component",
    "editor",
    "ui/rte-dropdown-icon.tsx"
  ),
  entry(
    "editor/ui/rte-color-swatch.tsx",
    "registry:component",
    "editor",
    "ui/rte-color-swatch.tsx"
  ),
];

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
    "block-editor/bottom-bar.tsx",
    "registry:component",
    "block-editor",
    "bottom-bar.tsx"
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
  entry(
    "block-editor/context.tsx",
    "registry:component",
    "block-editor",
    "context.tsx"
  ),
  entry(
    "block-editor/icon-types.ts",
    "registry:component",
    "block-editor",
    "icon-types.ts"
  ),
  entry(
    "block-editor/icons.tsx",
    "registry:component",
    "block-editor",
    "icons.tsx"
  ),
  entry(
    "block-editor/language-icons.tsx",
    "registry:component",
    "block-editor",
    "language-icons.tsx"
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
    "block-editor/ui/index.ts",
    "registry:component",
    "block-editor",
    "ui/index.ts"
  ),
  entry(
    "block-editor/ui/bubble-button.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-button.tsx"
  ),
  entry(
    "block-editor/ui/bubble-button-group.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-button-group.tsx"
  ),
  entry(
    "block-editor/ui/bubble-separator.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-separator.tsx"
  ),
  entry(
    "block-editor/ui/bubble-dropdown.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-dropdown.tsx"
  ),
  entry(
    "block-editor/ui/bubble-dropdown-item.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-dropdown-item.tsx"
  ),
  entry(
    "block-editor/ui/bubble-dropdown-divider.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-dropdown-divider.tsx"
  ),
  entry(
    "block-editor/ui/bubble-dropdown-icon.tsx",
    "registry:component",
    "block-editor",
    "ui/bubble-dropdown-icon.tsx"
  ),
  entry(
    "block-editor/ui/dropdown-overlay.tsx",
    "registry:component",
    "block-editor",
    "ui/dropdown-overlay.tsx"
  ),
  entry(
    "block-editor/ui/color-swatch.tsx",
    "registry:component",
    "block-editor",
    "ui/color-swatch.tsx"
  ),
  entry(
    "block-editor/ui/slash-menu.tsx",
    "registry:component",
    "block-editor",
    "ui/slash-menu.tsx"
  ),
  entry(
    "block-editor/ui/slash-menu-search.tsx",
    "registry:component",
    "block-editor",
    "ui/slash-menu-search.tsx"
  ),
  entry(
    "block-editor/ui/slash-menu-search-input.tsx",
    "registry:component",
    "block-editor",
    "ui/slash-menu-search-input.tsx"
  ),
  entry(
    "block-editor/ui/slash-menu-list.tsx",
    "registry:component",
    "block-editor",
    "ui/slash-menu-list.tsx"
  ),
  entry(
    "block-editor/ui/slash-menu-item.tsx",
    "registry:component",
    "block-editor",
    "ui/slash-menu-item.tsx"
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

const iconSetEntry = (dir, pkg, set) => {
  const path = `${dir}/icons.tsx`;
  const src = `icons-${set === "remixicon" ? "remix" : set}.tsx`;
  const content = read(pkg, src);
  assertNoSelfImport(dir, set, content);
  return {
    content,
    path,
    target: `@components/${path}`,
    type: "registry:component",
  };
};

const assertNoSelfImport = (dir, set, content) => {
  const selfImport = new RegExp(`from "\\./icons"`);
  if (selfImport.test(content)) {
    throw new Error(
      `icons-${set}.tsx (${dir}) imports from "./icons", which it overwrites. Import the icon types from "./icon-types" instead.`
    );
  }
};

const iconSetDeps = {
  hugeicons: ["@hugeicons/react@^1.1.10", "@hugeicons/core-free-icons@^4.3.5"],
  phosphor: ["@phosphor-icons/react@^2.1.10"],
  remixicon: ["@remixicon/react@^4.9.0"],
  tabler: ["@tabler/icons-react@^3.48.0"],
};

const iconSetTitles = {
  hugeicons: "HugeIcons",
  phosphor: "Phosphor Icons",
  remixicon: "Remix Icon",
  tabler: "Tabler Icons",
};

const iconSetItems = ["phosphor", "tabler", "hugeicons", "remixicon"].flatMap(
  (set) => [
    {
      deps: iconSetDeps[set],
      description: `${iconSetTitles[set]} variant of the Rich Text Editor icons. Install after the editor item; overwrites editor/icons.tsx.`,
      files: [iconSetEntry("editor", "editor", set)],
      name: `editor-icons-${set}`,
      title: `Rich Text Editor (${iconSetTitles[set]})`,
    },
    {
      deps: iconSetDeps[set],
      description: `${iconSetTitles[set]} variant of the Block Editor icons. Install after the block-editor item; overwrites block-editor/icons.tsx.`,
      files: [iconSetEntry("block-editor", "block-editor", set)],
      name: `block-editor-icons-${set}`,
      title: `Block Editor (${iconSetTitles[set]})`,
    },
  ]
);

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
  readText(
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
  readText(resolve(root, "packages", "extensions", "manifest.json"), "utf-8")
);

const extensionsConfig = Object.entries(extensionsManifest).map(
  ([slug, meta]) => ({
    ...meta,
    name: slug,
  })
);

const rewriteExtensionsContent = (content) =>
  content
    .replaceAll("@editorcn/ui/components/", "@components/extensions/ui/")
    .replaceAll("@editorcn/ui/lib/", "@/lib/");

const extensionsUiDir = resolve(root, "packages", "extensions", "src", "ui");

const extensionUiExists = (name) =>
  existsSync(resolve(extensionsUiDir, `${name}.tsx`));

const collectExtensionUi = (name, out = new Map()) => {
  if (out.has(name) || !extensionUiExists(name)) {
    return out;
  }
  const content = readText(resolve(extensionsUiDir, `${name}.tsx`), "utf-8");
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
    config.toolbar,
    config.overlay,
  ].filter(Boolean);
  const entries = sourceFiles.map((file) =>
    entry(`extensions/${file}`, "registry:component", "extensions", file)
  );
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
  const styleEntries = styles.map((file) => ({
    content: readText(
      resolve(root, "packages", "extensions", "src", file),
      "utf-8"
    ),
    path: `extensions/${file}`,
    target: `@components/extensions/${file}`,
    type: "registry:style",
  }));
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
  return {
    deps: [...new Set([...extensionsBaseDeps, ...(config.deps ?? [])])],
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
  registryDependencies
) => {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    dependencies,
    description: desc,
    files,
    name,
    title,
    type: "registry:component",
  };
  if (registryDependencies) {
    item.registryDependencies = registryDependencies;
  }
  return item;
};

const catalogItem = (name, title, desc, depsList, fileList) => ({
  dependencies: depsList,
  description: desc,
  files: fileList.map((f) => ({ path: f.path, type: f.type })),
  name,
  title,
  type: "registry:component",
});

const buildItemWithType = (
  name,
  title,
  desc,
  files,
  dependencies,
  registryDependencies,
  type
) => {
  const item = buildItem(name, title, desc, files, dependencies);
  item.type = type;
  if (registryDependencies) {
    item.registryDependencies = registryDependencies;
  }
  return item;
};

const templateDeps = {
  "comment-box": [
    "@tiptap/core@>=3.0.0 <4",
    "@tiptap/static-renderer@>=3.21.0 <4",
    "@tiptap/react@>=3.0.0 <4",
    "@tiptap/pm@>=3.0.0 <4",
    "@tiptap/starter-kit@>=3.0.0 <4",
    "@tiptap/extension-placeholder@>=3.0.0 <4",
  ],
  "simple-document-editor": [
    "@tiptap/core@>=3.0.0 <4",
    "@tiptap/react@>=3.0.0 <4",
    "@tiptap/pm@>=3.0.0 <4",
    "@tiptap/starter-kit@>=3.0.0 <4",
    "@tiptap/extension-placeholder@>=3.0.0 <4",
    "@tiptap/extension-link@>=3.0.0 <4",
    "@tiptap/extension-highlight@>=3.0.0 <4",
    "@tiptap/extension-task-list@>=3.0.0 <4",
    "@tiptap/extension-task-item@>=3.0.0 <4",
    "@tiptap/extension-text-align@>=3.0.0 <4",
    "@tiptap/extension-text-style@>=3.0.0 <4",
    "@tiptap/extension-color@>=3.0.0 <4",
    "@tiptap/extension-font-family@>=3.0.0 <4",
    "@tiptap/extension-subscript@>=3.0.0 <4",
    "@tiptap/extension-superscript@>=3.0.0 <4",
    "lucide-react@>=0.400.0 <1.0.0",
  ],
};

const templateItems = [
  {
    deps: templateDeps["comment-box"],
    desc: "A comment thread with avatars, relative times, emoji reactions, a delete menu, and an editor composer with onPost, onReact, and onDelete hooks.",
    files: templateEntry("comment-box"),
    name: "comment-box",
    title: "Comment Box",
    ui: [
      "avatar",
      "button",
      "dropdown-menu",
      "kbd",
      "popover",
      "https://editorcn.vercel.app/r/static-renderer.json",
    ],
  },
  {
    deps: templateDeps["simple-document-editor"],
    desc: "A document page with a breadcrumb header, collaborators, a floating toolbar, task lists, and a status bar with word count and shortcuts.",
    files: templateEntry("simple-document-editor"),
    name: "simple-document-editor",
    title: "Simple Document Editor",
    ui: [
      "avatar",
      "button",
      "dropdown-menu",
      "kbd",
      "popover",
      "tooltip",
      "https://editorcn.vercel.app/r/table.json",
      "https://editorcn.vercel.app/r/image-placeholder.json",
    ],
  },
];

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
      deps.editor
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
      deps["block-editor"]
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
      deps["static-renderer"]
    ),
    null,
    2
  )
);

for (const item of extensionsItems) {
  writeFileSync(
    resolve(outDir, `${item.name}.json`),
    JSON.stringify(
      buildItem(item.name, item.title, item.description, item.files, item.deps),
      null,
      2
    )
  );
}

for (const item of templateItems) {
  writeFileSync(
    resolve(outDir, `${item.name}.json`),
    JSON.stringify(
      buildItemWithType(
        item.name,
        item.title,
        item.desc,
        item.files,
        item.deps,
        ["https://editorcn.vercel.app/r/editor.json", ...item.ui],
        "registry:block"
      ),
      null,
      2
    )
  );
}

const writtenIconsets = new Map();

for (const item of iconSetItems) {
  writeFileSync(
    resolve(outDir, `${item.name}.json`),
    JSON.stringify(
      buildItem(item.name, item.title, item.description, item.files, item.deps),
      null,
      2
    )
  );
  writtenIconsets.set(item.name, item);
}

for (const [name, item] of writtenIconsets) {
  const dir = name.startsWith("editor-icons-") ? "editor" : "block-editor";
  const [firstFile] = item.files;
  const { content } = firstFile;

  if (/from "\.\/icons"/.test(content)) {
    throw new Error(
      `${name}: icons.tsx imports "./icons", which it overwrites.`
    );
  }

  if (dir === "block-editor" && !/export const HeadingIcon/.test(content)) {
    throw new Error(
      `${name}: icons.tsx must export HeadingIcon; bubble-menu/node-selector.tsx imports it.`
    );
  }

  if (!/from "\.\/icon-types"/.test(content)) {
    throw new Error(
      `${name}: icons.tsx should take its types from "./icon-types".`
    );
  }
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
      editorFiles
    ),
    catalogItem(
      "block-editor",
      "Block Editor",
      "A Notion-style block editor built on Tiptap with shadcn/ui tokens.",
      deps["block-editor"],
      blockEditorFiles
    ),
    catalogItem(
      "static-renderer",
      "Static Renderer",
      "Read-only rendering and styling for HTML produced by editor and block-editor.",
      deps["static-renderer"],
      staticRendererFiles
    ),
    ...extensionsItems.map((item) =>
      catalogItem(
        item.name,
        item.title,
        item.description,
        item.deps,
        item.files
      )
    ),
    ...templateItems.map((item) => ({
      dependencies: item.deps,
      description: item.desc,
      files: item.files.map((f) => ({ path: f.path, type: f.type })),
      name: item.name,
      title: item.title,
      type: "registry:block",
    })),
    ...iconSetItems.map((item) =>
      catalogItem(
        item.name,
        item.title,
        item.description,
        item.deps,
        item.files
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
for (const item of templateItems) {
  console.log(`  apps/web/public/r/${item.name}.json`);
}
for (const item of iconSetItems) {
  console.log(`  apps/web/public/r/${item.name}.json`);
}
