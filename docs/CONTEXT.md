# CONTEXT — working knowledge for this repo

**Last verified:** 2026-09-29. This is the file to read (or hand to an AI agent) _before_ making the first change. It collects what cost us time once and is not inferable from the code.

---

## 1. Glossary

| Term                | Meaning                                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main` docs         | The user-facing site docs under `apps/web/content/docs` (published). Distinct from this `docs/` folder (internal).                                                                                        |
| registry item       | One distributable in `apps/web/public/r/<name>.json`. `shadcn add @editorcn/<name>` installs it.                                                                                                          |
| catalog             | `apps/web/public/r/registry.json`, the index of all five items.                                                                                                                                             |
| flattening          | The process of copying `@editorcn/editor-ui` sources into a registry item and rewriting imports to consumer aliases (`@components/editor-ui/...`, `@/lib/utils`). See `scripts/build-registry.mjs:23-50`. |
| `transpilePackages` | Next config list making raw-TS workspace packages runnable in dev/build.                                                                                                                                  |
| bubble menu         | The floating formatting toolbar that appears over a selection.                                                                                                                                            |
| slash command       | The `/`-triggered suggestion menu in the block editor; the surface ships _inside_ the consumer's tree (`block-editor/extensions/slash-command/...`).                                                      |
| `[data-active]`     | The state hook shipped CSS uses to style pressed/active toolbar items (e.g. bold, currently-applied color). Set by the components; styled only in `style.css`.                                            |
| source-ownership    | The core promise: after install the user has the code, and can edit any class/behavior without an upgrade overwriting it.                                                                                 |

## 2. Commands

| What                  | Command                                   | Notes                                                                                                                   |
| --------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Dev (the docs site)   | `pnpm dev:web`                            | Rebuilds registry first; serves `http://localhost:3001`, block editor demo at `/block-editor`, editor demo at `/editor` |
| Dev, all workspaces   | `pnpm dev`                                | Turbo run dev                                                                                                           |
| Rebuild registry only | `pnpm build:registry`                     | `node scripts/build-registry.mjs` — run after _any_ source change under the packages                                    |
| editor-ui invariants | `pnpm check:editor-ui`                      | `node scripts/check-editor-ui.mjs` — D4/D8 contracts, registry import resolution, motion tokens, npm bundle guards              |
| Sync shared CSS      | `pnpm sync:styles`                          | Injects motion tokens + syntax theme into the shipped stylesheets; run after editing `packages/editor-ui/src/styles/`          |
| Typecheck             | `pnpm typecheck`                          | Turbo task, per-package `tsc --noEmit`                                                                                  |
| Lint/format           | `pnpm check` (check) `pnpm fix` (autofix) | ultracite + oxlint; auto-runs via lefthook on pre-commit                                                                |
| Build                 | `pnpm build`                              | Turbo; web build also regenerates registry                                                                              |
| Install               | `pnpm install`                            | `.gitignore`d; never commit a repo-relative `node_modules`                                                              |

CI runs `check`, `build`, `typecheck` (`.github/workflows/ci.yml`) on Node 22 / pnpm 10.12.4.

## 3. Conventions that are rules

1. **`editor-ui` primitives are first-party source.** They originated from the shadcn CLI (base-nova) but are **not** regenerated — edit them in place. Deliberate divergences are recorded in the deviations table in [DECISIONS](./DECISIONS.md#d2-editor-ui-primitives-are-first-party-code-not-generated-output) (popover focus flags, separator attributes, the motion token system). Anything that looks like a "fix" to a component you do not recognize — check DECISIONS before reverting. `pnpm check:editor-ui` fails loudly if the D4/D8 contracts break.
2. **No focus-steal from popovers.** `Popover` in `editor-ui` keeps `initialFocus={false}` `finalFocus={false}`. The block editor's node views depend on it. Bubble menus must `preventDefault()` in `onMouseDown` so the Tiptap selection survives interacting with the menu (that is why marker buttons feel "dead" if you `focus()` inside them).
3. **The slash list is a custom surface and stays one.** Tiptap's `suggestion` extension owns the keyboard; we hand-render a `role="listbox"` — do not move it behind the generic menu.
4. **Theme hooks in CSS.** Active/state styling is `[data-active]` in the shipped `style.css`, not `variant="secondary"` and not inline hex.
5. **Native inputs for forms.** Link/slash search fields are real `<input>`s; no `.focus()` calls or ghost elements.
6. **`style.css` mirrors the classes.** A component class added to a Tailwind utility and not mirrored in the shipped CSS compiles in our demos but not in installed apps. (ARCHITECTURE §6.)
7. **Never import from `apps/web` in packages, and never edit `apps/web/src/...` as a registry shortcut.** PRD N6.

## 4. Gotchas (symptom → cause → fix)

1. **Bubble-menu separators invisible.** shadcn's separator CSS targeted `[data-horizontal]`/`[data-vertical]`, but `@base-ui/react` 1.5 emits `data-orientation`. There was also no `mx-0.5` for the block editor layout. Fix: `packages/editor-ui/src/components/separator/separator.tsx` uses `data-[orientation=horizontal]`, plus `separator/data-separator` layout margins. Do not revert to the old attribute names.
2. **Active state invisible in dark mode.** The package styles keyed active state to `secondary`-tinted variables that vanish on dark surfaces. Fix: `[data-active]` is styled against `accent` in both editors' `style.css` (`.block-editor-bubble-menu [data-active]`, `.rte-bubble-menu [data-active]`).
3. **Registry serves stale code.** `apps/web/.next` + `public/r/*.json` are stale after package edits until `pnpm build:registry` regenerates them, and dev/build regenerates automatically, but a _running_ server keeps serving the old JSON. Restart `pnpm dev:web` after package changes.
4. **Check output does not test logic.** `pnpm check` is oxlint/ultracite only; there is no test runner. Use `pnpm check:editor-ui` for the invariants that matter (D4/D8 contracts, registry import resolution, `tw-animate-css` and motion-token presence, npm bundle correctness) and eyeball the generated JSON for anything else. A green `pnpm check` alone is not proof a registry output is correct.
5. **Dark `--popover` looks like `--secondary`/`--muted`.** `oklch(0.269 0 0)` in `packages/ui/src/styles/globals.css` is _intentionally left as-is_ (DECISIONS D9). Resist "fixing" it.
6. **Stray `@tiptap/*` hard pins.** `apps/web/tsconfig.json` pins `@tiptap/core: 2.27.2` + `@tiptap/pm: 2.27.2` paths, and `packages/editor/tsconfig.json` aliases `@editorcn/packages/editor/*` (the old npm name). Neither matches reality (packages are `>=3.0.0 <4`, aliases now `@editorcn/editor`). Catalogued as debt, not "working as intended".
7. **Shipped CSS is generated in two places.** Motion tokens and the syntax theme are not hand-maintained: they live in `packages/editor-ui/src/styles/{motion,syntax-highlighting}.css` and are injected between `/* editor-motion:start|end */` and `/* editor-syntax:start|end */` markers by `pnpm sync:styles`. Edit the source, run the sync, never edit inside the markers. Shipped stylesheets are plain CSS with no `@theme`/`@apply`, because npm consumers import them without a Tailwind pipeline. (Resolved 2026-09-29: `@editorcn/block-editor` now has `"files": ["dist"]`.)
8. **opencode.json hardcodes a machine path.** The local `opencode.json` MCP entry points at `C:\Users\...\editorcn\editorcn\node_modules\shadcn\dist\index.js`. It is per-machine, not checked-in stable.
9. **Registry `dependencies` are hand-authored.** They lag package peers (Tiptap `>=2.11.5 <4` vs `>=3.0.0 <4`). If you bump a dependency in `packages/*/package.json`, update the corresponding array inside `scripts/build-registry.mjs` too.
10. **`apps/web` dev port is 3001**, not 3000 (Next default). `EADDRINUSE` on 3001 usually means a stale dev server is already running.

## 5. How to add a new extension (the supported flow)

1. Add the node to `packages/extensions/src/<slug>/` (and its `style.css`).
2. Enumerate its files + deps in `packages/extensions/manifest.json` (extension, node, actions/menu/toolbar/overlay files, `css[]`, deps).
3. Reference it in `apps/web/content/docs/...` so the docs page ships with it.
4. Rebuild registry, then eyeball `apps/web/public/r/<slug>.json` (imports rewritten to `@components/...`, CSS included, deps correct).
5. Verify on the docs demo that the extension imports, installs, and styles as a _fresh_ consumer would.

## 6. How to verify a change end-to-end

1. `pnpm typecheck` (packages + web) — catches the "fixed a component but broke an export" class.
2. `pnpm check` — formatting/lint gate.
3. `pnpm build:registry` then diff the `apps/web/public/r/*.json` you touched against expected file lists.
4. `pnpm dev:web` on port 3001 → manually pass through `/block-editor` (slash, drag handle, bubble menu, node views), `/editor` (toolbar, bubble, color/highlight), and an extension page if you changed extensions.
5. If you changed shipped CSS, confirm both light and dark on each surface.

## 7. Sources of truth (when in doubt)

- **Chronology/decisions:** [`JOURNAL.md`](../JOURNAL.md) and [`DECISIONS.md`](./DECISIONS.md)
- **Layout/build:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **On the wire:** `apps/web/public/r/*.json`
- **User contract:** `apps/web/content/docs`
- **Process:** [`CONTRIBUTING.md`](../CONTRIBUTING.md)
