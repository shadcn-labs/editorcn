# ARCHITECTURE — how editorcn is built

**Last verified:** 2026-09-29. Read this before changing any package, the registry generator, or the docs site.

---

## 1. The two facts everything else follows from

1. **Users receive source, not binaries.** The four product surfaces are distributed through the shadcn registry; `npx shadcn add` copies files into the consumer's `components/` tree. The mechanism for this is [`scripts/build-registry.mjs`](../scripts/build-registry.mjs).
2. **The repo mixes two consumption styles at runtime.** Three packages are published to npm as compiled `dist` (`@editorcn/editor`, `@editorcn/block-editor`, `@editorcn/static-renderer`), while four are consumed as raw TypeScript from `node_modules` via Next's `transpilePackages` and are published by registry flattening only (`@editorcn/editor-ui`, `@editorcn/extensions`, plus dot-prefixed private helpers `@editorcn/config`, `@editorcn/env`). Any architecture change must decide which of these channels it is changing.

The `ui` package is the shadcn CLI's home; the extension packages hold registry-consumable node extensions; nothing in `apps/web` is imported by the packages (PRD N6).

## 2. Repo layout

```
apps/web                 Next 16 + fumadocs docs/demo app (also hosts the registry)
packages/
  editor                 publishable — toolbar editor (tsup → dist)
  block-editor           publishable — block editor (tsup → dist)
  static-renderer        publishable — read-only rendering (tsup → dist)
  editor-ui              private — shadcn/Base UI primitives shared by editors, folder-per-component
  extensions             private — manifest.json module: image-placeholder, table
  ui                     private — shadcn CLI-generated themes/styles (input to editor-ui)
  config                 private — shared tsconfig bases
  env                    private — env validation + presets (@editorcn/env/web imported by apps/web)
scripts/build-registry.mjs   the registry generator (774 lines, hand-maintained file lists)
```

Workspaces are defined in [`pnpm-workspace.yaml`](../pnpm-workspace.yaml) (which also carries the version `catalog`). Provenance: scaffolded on 2026-06-08 with Better-T-Stack v3.32.0 (`frontend: next`, `addons: turborepo`, no backend/db/api/auth) — see [`bts.jsonc`](../bts.jsonc).

## 3. Package inventory

| Package                     | Version | Private | Consumed as                  | Build             | Emits                  | `apps/web` imports it    |
| --------------------------- | ------- | ------- | ---------------------------- | ----------------- | ---------------------- | ------------------------ |
| `@editorcn/editor`          | 0.3.3   | no      | npm `dist` + types           | tsup, cjs+esm+dts | dist                   | yes (transpiles nothing) |
| `@editorcn/block-editor`    | 0.3.3   | no      | npm `dist` + types           | tsup              | dist                   | yes                      |
| `@editorcn/static-renderer` | 0.2.2   | no      | npm `dist` + types           | tsup              | dist                   | yes                      |
| `@editorcn/extensions`      | 0.1.0   | yes     | source (`transpilePackages`) | none (no tsup)    | registry items only    | via registry             |
| `@editorcn/editor-ui`       | 0.0.0   | yes     | source                       | none              | registry flatten only  | via registry             |
| `@editorcn/ui`              | 0.0.0   | yes     | source                       | none              | none (CLI scratchpad)  | via registry             |
| `@editorcn/config`          | —       | yes     | source                       | none              | tsconfig bases         | no                       |
| `@editorcn/env`             | —       | yes     | source                       | none              | env validators/presets | yes (side-effect import) |

_Assumption:_ versions/`files` fields verified at write time; `@editorcn/block-editor/package.json` has no `files` field today, so a `pnpm publish` would ship `src/` — see ROADMAP debt D3.

## 4. Build pipeline

`turbo.json` tasks: `build` (`dependsOn: ^build`, outputs `dist/**` + `.next/**`), `typecheck` (`dependsOn: ^typecheck`), `lint`, `dev` (persistent, uncached). Top-level scripts in `package.json`: `dev` → `turbo run dev`, `build` → `turbo run build`, `build:registry`, `typecheck`, `check`/`fix` (format/lint via ultracite + oxlint per `.prettierrc`-driven config), `dev:web`. The docs app regenerates the registry before starting or building:

- `apps/web/package.json#dev`: `node ../../scripts/build-registry.mjs && next dev --port 3001`
- `apps/web/package.json#build`: `node ../../scripts/build-registry.mjs && next build`

The three publishable packages each have a tsup config that builds `src/index.ts` to `dist/` (cjs + esm + `.d.ts`), with `exports` maps pointing at the dist files and `types` conditions up front (e.g. `packages/editor/package.json#exports`). This is the only output that reaches npm.

## 5. Runtime consumers inside this repo

`next.config.mjs` passes exactly four workspace packages through `transpilePackages`, and enables `reactCompiler`. `typedRoutes` is commented out because of a Next 16 bug with `@base-ui/react` Form types — do not re-enable it without hitting that bug first. A side-effect `import "@editorcn/env/web"` validates the docs app env at boot.

Important nuance: `@editorcn/editor` and `@editorcn/block-editor` are listed in `transpilePackages` even though they ship compiled dist. That list exists because the registry items the site _serves_ are built from the source read directly by `build-registry.mjs`, and the transpile entry keeps both consumption paths working in the same dev process. Do not remove packages from that list without testing both editors in `/block-editor` and `/editor` demos.

## 6. The styling contract

Three layers, intentionally:

| Layer                   | Owned by                                                                                               | Example                                                           | Rules                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Theme tokens            | Consumer's shadcn setup                                                                                | `--background`, `--popover`, `--accent`, `--radius`               | We never redefine these                                                    |
| Controls (UI logic)     | `@editorcn/editor-ui` (shadcn base-nova + Base UI) + inline-extended primitives in editor/block-editor | `Button`, `Toggle`, `DropdownMenu`, `Popover`                     | Tailwind utilities only, generated by the shadcn CLI; folder-per-component |
| Content/shell/state CSS | The shipped `style.css` of each surface                                                                | `.rte-toolbar`, `.block-editor-bubble-menu`, `.notion-gap-cursor` | Plain CSS custom-properties + classes, imported explicitly by the consumer |

Rules that come from this split:

- **Theme hooks live in CSS, not in component variants.** Active/inactive toolbar items are keyed off the DOM (`[data-active]` in both `.block-editor-bubble-menu` and `.rte-bubble-menu`), so a consumer re-themes active state with CSS, no prop drilling. `variant="secondary"` is not used for active state (see DECISIONS D7).
- **No hex values.** Where a token or shadcn variable exists, the CSS consumes it (`--popover`, `--accent`, `--ring`, …). The one intentionally untouched literal is the dark `--popover` default (DECISIONS D9).
- **The Tailwind scanning implication:** editors cannot rely on Tailwind scanning _their own_ CSS for classes the consumer might not have compiled. The shipped `style.css` of each editor contains, verbatim, the utility classes the components use (via mirroring in `packages/ui` globals + the editor styles), and the consumer's `@tailwindcss/postcss` compiles what it finds. Changing a component's classes without updating the shipped CSS breaks installed apps.

## 7. The registry pipeline

### 7.1 Shape of the output

The site publishes one catalog — `apps/web/public/r/registry.json` — and one file per item under `apps/web/public/r/`. Each item file has: `$schema`, `name`, `title`, `description`, `type`, `files[]`, `dependencies[]`. As of this writing **no item uses `registryDependencies`** (the collect/resolve logic exists at `scripts/build-registry.mjs:640-652` but emits nothing today). Item file counts (verified):

| Item              | files | components | style | deps |
| ----------------- | ----- | ---------- | ----- | ---- |
| editor            | 33    | 32         | 1     | 21   |
| block-editor      | 28    | 27         | 1     | 29   |
| static-renderer   | 4     | 3          | 1     | 5    |
| image-placeholder | 18    | 17         | 1     | 8    |
| table             | 14    | 13         | 1     | 12   |

### 7.2 How an item is built

The generator is a **single pass over explicit, hand-maintained file lists**:

1. **Editor/block-editor source lists** — hardcoded `entry(...)` calls mapping `packages/editor/src/...` → `@components/<path>` (`registry:component`, `registry:lib`, `registry:style`). CSS is included as an explicit `registry:style` entry (`scripts/build-registry.mjs:123`, `:301`).
2. **Slash-command surface** — the block editor's suggestion flow ships as part of the item: `extensions/slash-command/{index,slash-command,suggestion,suggestion-list}` plus `lib/commands.ts` are emitted _in the consumer's own tree_ as `block-editor/extensions/...`, i.e. the slash menu is not hidden in a launcher (`:307-347`).
3. **editor-ui flattening** — `collectEditorUi` (`:28-50`) recursively pulls the `@editorcn/editor-ui` primitives a file imports, rewrites `cn` → `@/lib/utils` and relative `../x` → `@components/editor-ui/x.tsx`, and emits them at `@components/editor-ui/*`. The top-level `rewriteEditorUiImports` then rewrites every remaining `@editorcn/editor-ui/components/` / `/lib/` reference in the shipped source to the consumer-aliased paths (`:23-26`, applied at `:352`). This is why an installed editor runs without `@editorcn/editor-ui` being installed.
4. **Extensions from `manifest.json`** — `packages/extensions/manifest.json` defines each extension's `extension`, `node`, `actions`, `menu`, `theme`/`image`/`toolbar`/`overlay` files, `css[]` list, and `deps`. The generator reads that manifest (`:426-438`), collects the extension's own UI (`:440-459`, same flattening trick, `@editorcn/ui/components/` → `@components/extensions/ui/`), and assembles per-extension items. Extension deps use `>=3.0.0 <4` (`:420-424`).
5. **Dependency lists are hand-authored constants** — e.g. editor/block-editor dep arrays are literal arrays; Tiptap entries there say `>=2.11.5 <4` (`:594`, `:617`) while the actual packages declare `>=3.0.0 <4`. They are **not** derived from `package.json`. This is the primary source of registry drift (ROADMAP D5).
6. **Writing** — each item is serialized to its JSON file from a `catalogItem(...)` list that also builds `registry.json` (`:735-765`). The generator writes but **never cleans `apps/web/public/r/`** — removed items would linger.

### 7.3 What "flattened" means for consumers

After `shadcn add @editorcn/editor`, a consumer's tree contains:

```
components/editor/               (the editor source, imports rewritten)
components/editor-ui/            (only the primitives the editor actually used)
components/editor/extensions/…   (block-editor slash-command surface)
components/lib/utils.ts          (the shadcn `cn` helper)
editor/style.css                 (consumer imports this explicitly)
```

Nothing pulls `@editorcn/*` at runtime: every import was rewritten to the consumer's own tree or to `@/lib/utils`. The npm-dist path is only for consumers who prefer a dependency.

## 8. The docs site + agent surface

`apps/web` is Next 16 + fumadocs-MDX. Content lives in `apps/web/content/docs`; `apps/web/src/lib/source.ts` is the content source and drives the MDX language map passed to route handlers. **Machine-readable endpoints** (all in `apps/web/src/app`, served statically):

- `/llms.txt` — index of every docs page + pointers to the resources below (route: `llms.txt/route.ts`, uses `llms(source).index()`)
- `/llms.md` (`.md` mirrors of pages), `/api/mdx/[...slug]` — page markdown served as raw MDX, exposed so agents can fetch prose as JSON
- `/openapi.json` — generated from the site's route handlers (`openapi.json/route.ts`)
- `/.well-known/api-catalog` — Link header + catalog mapping (`.well-known/api-catalog/route.ts`)
- `/robots.txt`, `/sitemap.ts`, `/manifest.ts` standard.

Rules: content is MDX in `apps/web/content/docs`; page files also declare `frontmatter` parsed by the MDX engine; installation/API pages are the "user contract" but also the agent's training surface — `llms.txt` rewrites every `/docs/...md` (see the `.[.]` regex at `llms.txt/route.ts:14`).

## 9. CI and quality gates

`.github/workflows/ci.yml` runs `pnpm check`, `pnpm build`, and `pnpm typecheck` on push/PR (docs app's build script also regenerates the registry). The composite setup action pin Node 22 + pnpm 10.12.4 and runs a frozen-lockfile install (`.github/actions/setup/action.yml`). Lefthook runs `pnpm fix` on staged `.ts/.tsx/.css` pre-commit (`lefthook.yml`).

Hard reality: **there is no test runner in this repo** — no runtime, no unit/integration/e2e framework, no `test` script. Coverage comes only from CI type/lint/build + the registry generator's correctness. The highest-leverage test target would be `build-registry.mjs` (pure, deterministic, file-based I/O).

## 10. Change impact cheat sheet

| If you change…                                                                                                         | You must also…                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Any file under `packages/editor/src`, `packages/block-editor/src`, `packages/editor-ui/src`, `packages/extensions/src` | Rebuild the registry (`pnpm build:registry`) or the served demos/docs lie; update consumer-facing docs in `apps/web/content/docs` |
| A component's Tailwind classes                                                                                         | Ship the corresponding class in the surface's `style.css` (or the consumer's Tailwind won't compile it)                           |
| `packages/editor`/`block-editor` exports or peers                                                                      | `pnpm typecheck`, bump version, and align the registry item's hand-written `dependencies` (they are not derived)                  |
| `next.config.mjs` tsconfig paths (`@tiptap/*` 2.x pins)                                                                | Test both editors; those pins are drift, see ROADMAP D8                                                                           |
| The registry output dir                                                                                                | Remember `build-registry.mjs` never cleans `apps/web/public/r/`                                                                   |
