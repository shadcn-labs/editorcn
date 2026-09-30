# 2026-09-27 — shared editor UI package (session record)

## Decision (supersedes prior plan)
- Earlier plan was to extend global `packages/ui` with Base UI primitives. User flagged this is risky (used everywhere in web app). User then confirmed, via follow-up question, a **separate `@editorcn/editor-ui` package**.
- Also locked: preserve **no-focus-steal** for popovers/dropdowns used inside tiptap node views.

## Pivot during this session (user correction)
- User: "maintain a seperate folders for each component, also why are you hand writing the components?"
- So: do NOT hand-write. Use the `shadcn` CLI (v3.8.5, already a dep of packages/ui) to generate primitives, folder-per-component.

## What's done
- Scaffolded `packages/editor-ui`:
  - `package.json` (name `@editorcn/editor-ui`, private, exports `./components/* -> ./src/components/*/index.ts`, `./lib/* -> ./src/lib/*.ts`; deps: `@base-ui/react`, `class-variance-authority`, `clsx`, `cn`, `lucide-react` (catalog), `tailwind-merge`; typecheck script `tsc --noEmit`).
  - `tsconfig.json` extends `@editorcn/config/tsconfig.base.json`, paths `@editorcn/editor-ui/* -> ./src/*`.
  - `components.json` (style `base-lyra`, rsc false, lucide icons, aliases to `@editorcn/editor-ui/…`, registries @kibo-ui/@editorcn, tailwind.css `src/style.css`).
  - `src/lib/utils.ts` (cn via clsx + tailwind-merge).
- Ran CLI (from packages/ui where shadcn is installed):
  - `node packages/ui/node_modules/shadcn/dist/index.js add button -y -o -c packages/editor-ui`
  - then `add input separator tabs switch popover dropdown-menu checkbox`.
- Organized each into `src/components/<name>/<name>.tsx` + `index.ts` barrel.
- Kept only custom (non-CLI) primitives: `dropdown-pill`, `use-floating`.
- Renamed `use-floating.ts` → `use-floating.tsx` (contains JSX).
- `pnpm install --filter @editorcn/editor-ui` (deps pulled in: cn, class-variance-authority, etc.).
- Typecheck passes (packages/editor-ui).

## Focus decision (this session)
- Base UI `PopoverPopup` exposes `initialFocus`/`finalFocus` — set both to `false` on editor-ui PopoverContent to keep the required **no-focus-steal** behavior (verified in `FloatingFocusManager`: `false` short-circuits the "focus initial element on open" effect).
- Base UI `MenuPopup` hardcodes `initialFocus: parent.type !== 'menu'` (top-level menus ALWAYS move focus to first item on open; no prop escape hatch). Since no-focus-steal is a hard requirement for tiptap node views (image-placeholder/code-block/table), user chose: **custom no-focus-steal DropdownMenu**, not Base UI menu.

## What's done (continued)
- `dropdown-pill.tsx`: removed dead `eui-*` classes → Tailwind + inline transition (220ms cubic-bezier top/left/width/height, opacity 150ms, `bg-primary/6`, `rounded-[calc(var(--radius)-4px)]`).
- `popover.tsx` (CLI Base UI): PopoverContent now `initialFocus={false}` `finalFocus={false}`, `relative`, runs `useDropdownPill` + renders pill (so table toolbar `DropdownMenuItem`s inside a popover get the hover-follow pill too).
- `dropdown-menu/` REPLACED Base UI CLI version with custom no-focus-steal port (matches `packages/extensions/src/ui` API exactly):
  - `dropdown-menu.tsx` — trigger-cloning wrapper (`open/onOpenChange/side/trigger`) over `use-floating`.
  - `dropdown-menu-content.tsx` — div role="menu", `useDropdownPill` + pill, pop-in via tw-animate (`animate-in fade-in-0 zoom-in-95 slide-in-from-top-1`, 180ms cubic-bezier), shadow `0 8px 24px`.
  - `dropdown-menu-item.tsx` — `data-dropdown-item`, `danger`, active scale(0.98), hover→foreground.
  - `dropdown-menu-separator.tsx` — h-px bg-border.
  - `index.ts` exports all four; removed Base UI artifacts (Portal/Trigger/Group/Label/Checkbox/Radio/Sub/Shortcut).
- Switch: CLI `size="sm"` = 24×14 already matches Notion geometry; no change needed (no current Switch consumer in extensions).
- `pnpm exec tsc --noEmit` in packages/editor-ui -> passes.

# 2026-09-28 — Phase 2: extensions on the shared package (session record)

## What's done
- `packages/extensions/package.json`: added dependency `@editorcn/editor-ui: workspace:*`; removed `./ui`, `./ui/*`, `./ui/style.css` exports.
- editor-ui component tuning:
  - `PopoverContent` surface → content-driven Notion style: `z-50 relative border border-border bg-popover text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] outline-hidden rounded-[calc(var(--radius)-2px)]` + tw-animate pop-in (`fade-in-0 zoom-in-95 fade-out-0`, 180ms cubic-bezier(0.22,1,0.36,1)) via `cn`. No forced width/padding — consumers' CSS applies.
  - `Button` radius → `rounded-[calc(var(--radius)-2px)]`; `rounded-none` removed from `xs/sm/icon-xs/icon-sm` sizes. Leftover `active` prop dropped → map to `variant={cond ? "secondary" : "ghost"}` (`size="icon-sm"` = old `ext-btn--icon-sm` 28px; default `h-8` = old `ext-btn`).
- Rewrote the three consumers to Base UI composition / shared package (API: `PopoverTrigger render={<Button/>}`; `align/side/sideOffset` on `PopoverContent`; neutral `border-0 rounded-none bg-transparent p-0 shadow-none` classNames where the consumer's own CSS card is the visible surface):
  - code-block: `code-block-node.tsx` — lang + "more" Popovers composed over `.ext-code-block-menu` cards. Actions/content menus (`CodeBlockActionsMenu` etc.) use no ui imports.
  - image-placeholder: `image-placeholder-node.tsx` (PopoverTrigger + `ext-image-placeholder-popover` content), `image.tsx` (active→variant, `size="icon-sm"`), `toolbar.tsx` (`size="icon-sm" variant="ghost"`, `className` passthrough); removed dead `.ext-image-placeholder .ext-popover` CSS.
  - table: `toolbar.tsx` — `<Popover onOpenChange open>` + `<PopoverTrigger render={<Button variant={inTable?"secondary":"ghost"} size="icon-sm">}` + `<PopoverContent align="start" className="ext-table-toolbar-popover" side="bottom" sideOffset={6}>`; `table-hover-overlay.tsx` — DropdownMenu parts from shared package.
- Deleted `packages/extensions/src/ui/` (12 files: button, dropdown-*, input, popover*, separator, tabs, use-floating, style.css, index.ts).
- `manifest.json`: removed `ui` arrays from all three extensions (they referenced the deleted files).
- apps/web: removed `import "@editorcn/extensions/ui/style.css"` from `(app)/block-editor/page.tsx`, `block-editor-preview.tsx`, `editor-preview.tsx`, `extension-previews.tsx`; added `@editorcn/editor-ui` to package.json deps + `next.config.mjs` transpilePackages.
- Typechecks pass: editor-ui, extensions, apps/web. `build-registry.mjs` runs clean (emits JSONs w/o ui; `existsSync` on deleted dir = false, safe).

## Verified / notes
- No remaining `src/ui` references in `packages/extensions/src`; `@editorcn/editor-ui/components/{button,popover,dropdown-menu,separator,input,tabs}` imports all resolve.
- `extension-list.tsx` only reads manifest `title`/`description` — unaffected by ui-array removal.
- `packages/editor`'s `../ui` imports are its OWN `src/ui` (Phase 3 target), not the deleted extensions ui.
- Docs `.mdx` (code-block/image-placeholder/table) + regenerated `public/r/*.json` still stale w.r.t. editor-ui — deferred to Phase 4 (registry flatten + docs regen). Installing an extension from the current registry would pull files importing a package that isn't bundled yet.

## Next
- Phase 3: migrate `packages/editor` + `packages/block-editor`'s own `ui/` folders onto `@editorcn/editor-ui` (rte-* controls, rte-toolbar/footer/content, bubble menu, etc.).
- Phase 4: build-registry.mjs flatten editor-ui into registry items (rewrite `@editorcn/editor-ui/components/*` imports → inlined/extensions-ui paths), add `@base-ui/react` etc. as needed, regen registry + refresh docs `.mdx`; resolve keep-or-revert of `packages/ui/src/components/{switch,dropdown-pill}.tsx`; README note; visual check /block-editor.
# 2026-09-28 �?" dropdown rework: official shadcn Base UI menu (phase 2.5)

## What's done
- Installed/configured shadcn MCP: project opencode.json (untracked) -> `mcp.shadcn` = local server via `node C:\Users\...\editorcn\node_modules\shadcn\dist\index.js mcp` (npx variant fails on Windows); repo-root devDep `shadcn ^4.21.0`. Tools live: get/list/search/view_items_in_registries, get_add_command_for_items, get_audit_checklist.
- Verified official base-lyra **dropdown-menu IS Base UI** (`@base-ui/react/menu`) via https://ui.shadcn.com/r/styles/base-lyra/dropdown-menu.json; Base UI 1.5.0 Positioner sets `--available-height/--anchor-width/--transform-origin` (MenuPositionerCssVars.js), so official tw classes resolve. `MenuPopup.js` hardcodes `initialFocus: parent.type !== 'menu'` (no opt-out). **User decision: "Official shadcn verbatim"** (accept focus-to-first-item on open for menus in node views).
- Replaced custom no-focus-steal DropdownMenu in editor-ui with verbatim official component:
  - `dropdown-menu.tsx` (single file) �?" Root/Portal/Trigger/Content/Group/Label/Item(+variant destructive)/Sub/SubTrigger/SubContent/CheckboxItem/RadioGroup/RadioItem/Separator/Shortcut. Dropped ui.shadcn.com-internal `cn-menu-target cn-menu-translucent cn-rtl-flip` + `IconPlaceholder`; SubTrigger chevron/indicators use lucide (`ChevronRight`, `Check`). Kept exactly shadcn's base classes (`w-(--anchor-width) min-w-32 rounded-none ring-1 ring-foreground/10 shadow-md`, `data-open/closed` anims, `focus:bg-accent` items, `data-[variant=destructive]` styles).
  - Deleted `dropdown-menu-content/item/separator.tsx`; `index.ts` re-exports single file. Deleted `dropdown-pill/` + `use-floating/` folders (no remaining importers).
  - `popover.tsx`: removed `useDropdownPill` (pill gone app-wide); kept `initialFocus={false} finalFocus={false}` (no-focus-steal for popovers, still required + not part of the verbatim menu decision).
- Consumers rewritten to official Trigger/Content/Item API:
  - `table/table-hover-overlay.tsx` �?" column/row grip grip-menus: `<DropdownMenu open onOpenChange><DropdownMenuTrigger render={<button/>}/><DropdownMenuContent side align data-ext-floating>` + `variant="destructive"` (was `danger`). `data-ext-floating` keeps overlay from hiding while hovering the portal'd menu.
  - `image-placeholder/image.tsx` �?" more-menu -> Trigger/Content (`min-w-44`), destructive delete.
  - `table/toolbar.tsx` �?" in-table menu is now a REAL DropdownMenu (DropdownMenuLabel for Rows/Columns, DropdownMenuSeparator, destructive delete-table); grid picker remains a Popover; same trigger Button via `render`, rendered conditionally on `state.inTable`.
- CSS cleanup: removed now-unused `.ext-image-more-content` + `.ext-table-toolbar-label` rules.

## Verified
- Typechecks pass: editor-ui, extensions, apps/web. `pnpm --filter web build` compiles clean (only pre-existing changelog fs warnings). Registry rebuilt (`public/r/*.json`) �?" grep confirms no `ext-image-more-content|ext-table-toolbar-label|useDropdownPill|use-floating|data-dropdown-item` in table/image/code-block items (remaining data-dropdown-item hits are editor/block-editor's own ui/ folders = Phase 3). /block-editor dev-serves 200.
- Known/accepted: menu auto-focuses first item on open (verbatim). Pill hover-follow removed everywhere.

## Next
- Phase 3: migrate editor + block-editor own `ui/` (RteDropdown/BubbleDropdown pill items + gesture code) onto editor-ui.
- Phase 4: registry flatten editor-ui into items, docs .mdx regen, README note.
- Optional follow-up: extend editor-ui dropdown-menu index with a `DropdownMenuItem`-style popover menu item variant if a popover-contained menu is needed again (toolbar no longer uses that pattern).

# 2026-09-28 — Phase 3: editor + block-editor on the shared package (session record)

## What's done — editor (`@editorcn/editor`)
- Vendored missing primitives into editor-ui from the shadcn CLI (base-nova style, verbatim): `dialog/` + `toggle/`, each `src/components/<name>/<name>.tsx` + `index.ts` barrel. `dialog.tsx` keeps `import { Button } from "../button"` (relative — deliberately not the CLI's self-alias import); rest is CLI-exact. Declined the CLI's side-effect rewrite of `button.tsx` to the newer rounded-lg/text-sm variant (would ripple through app).
- Rewrote `src/ui` consumers onto `@editorcn/editor-ui`:
  - `rte-control.tsx`: `Toggle` + `cn`; `rte-link-control.tsx`: Button/Input/Popover/Toggle; `rte-youtube|twitter-control.tsx`: Dialog*/Input, footers now `DialogClose render={<Button variant="outline" size="sm"/>}` + `<Button size="sm" disabled>`.
  - `rte-toolbar|text-editor|footer|controls-group|content`: `cn` from `@editorcn/editor-ui/lib/utils`.
  - bubble-menu: `index.tsx` (Separator vertical h-5), `text-buttons.tsx` (editor-ui Button ghost/secondary icon-sm + local `Icon` span; `Svg` keeps `rte-editor-icon`), `color-swatch.tsx` (new local copy of the old ui/rte-color-swatch), `color-selector.tsx` (Popover + custom swatch grid + Separator dividers), `language-selector.tsx` (DropdownMenu + DropdownMenuRadioGroup/RadioItem, trigger = Button sm, `onMouseDown` prevented).
- Deleted `packages/editor/src/ui/` entirely. Cleaned `.rte-bubble-btn*/.rte-bubble-group/.rte-bubble-separator/.rte-bubble-overlay/.rte-bubble-dropdown*` CSS; kept `.rte-bubble-menu`, `.rte-bubble-color-*`.
- `package.json`: added `@editorcn/editor-ui` (workspace) + `lowlight` deps; added `@tiptap/extension-code-block-lowlight` peer (pre-existing typecheck failure, was only in apps/web).

## What's done — block-editor (`@editorcn/block-editor`)
- Rewrote `src/ui` consumers: `node-selector.tsx` + `align-selector.tsx` → official `DropdownMenu` (check on active, `variant="destructive"` for Delete, `DropdownMenuSeparator` for Copy/Delete); `link-selector.tsx` → `Popover` Form (Button ghost/text-destructive Remove + primary Add/Update, native input keeps `.block-editor-link-input` styling); `color-selector.tsx` → `Popover` + local `bubble-menu/color-swatch.tsx` (block-editor-color-* classes kept); `text-buttons.tsx` → Button ghost/secondary icon-sm in a flex group; `index.tsx` → Button + Separator vertical h-5; copy button now an icon-sm Button.
- Slash suggestion: inlined the 5 `ui/slash-menu*` primitives into `suggestion-list.tsx` (tiptap suggestion drives its own keyboard nav; a Base UI Menu would fight it). Kept the `.block-editor-slash-menu-*` classes, added `role="listbox"` / `role="option"` + `aria-selected`.
- Deleted `packages/block-editor/src/ui/`; removed `.block-editor-bubble-group/-btn*/-btn-text/-separator/-overlay/-dropdown*` CSS (kept `.block-editor-bubble-menu`, `.block-editor-copy-icon`, `.block-editor-color-*`, slash, link-form). Added `@editorcn/editor-ui` workspace dep.
- Typechecks clean: editor-ui, extensions, editor, block-editor.

## What's done — registry flatten (Phase 4, pulled forward: it blocked the build)
- `build-registry.mjs`: dropped all dead `editor/ui/*` and `block-editor/ui/*` entries; added `bubble-menu/color-swatch.tsx` to both; added editor-ui flattening —
  - `rewriteEditorUiImports`: `@editorcn/editor-ui/components/` → `@components/editor-ui/`, `@editorcn/editor-ui/lib/` → `@/lib/`.
  - `collectEditorUi(name)` transitively reads `packages/editor-ui/src/components/<name>/<name>.tsx`, rewrites `from "cn"` → `from "@/lib/utils"` and relative editor-ui deps (`dialog`'s `../button`) → `@components/editor-ui/<name>.tsx`.
  - `appendEditorUiDependencies(files)` gathers used components, appends `editor-ui/<name>.tsx` files to each item; wired into editor, block-editor, and per-extension items. Extensions that use editor-ui now also get `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge` in `deps`.
- Emitted `editor.json` (32 files incl. 7 editor-ui components), `block-editor.json` (26 → 4 editor-ui), table/code-block/image-placeholder include their editor-ui sets; `dialog.tsx` target verified (`../button` + `cn` rewrites land correctly). `@editorcn/editor-ui` / `@editorcn/ui/components` imports all resolved in output.
- Docs `.mdx` refreshed: `styling.mdx` class table (dropped dead `.block-editor-bubble-*` rows, added `.block-editor-color-*`, `.block-editor-copy-icon`, `.rte-bubble-menu`, `.rte-bubble-color-*`), bubble-menu customization sample now points at editor-ui composition, `editor/index.mdx` bubble sentence updated. Historical changelog entries left as-is.
- `pnpm --filter web build` green; `/block-editor` static route served.

## Notes / decisions
- `selection preservation` — `onMouseDown={(e) => e.preventDefault()}` kept on all bubble triggers/items/swatches so the bubble keeps its tiptap selection.
- Popover keeps `initialFocus={false} finalFocus={false}` (no-focus-steal); official Base UI menu auto-focus remains accepted (verbatim).
- Link URL + slash search stay native inputs with their own theme CSS (not editor-ui Input) — a bespoke surface, consistent with the earlier extensions code-block search input.

# 2026-09-28 — bubble menu polish after first visual pass (session record)

## Bugs found + fixed
- **Separators invisible (both editors)** — root cause: shadcn base-nova `separator` targets `data-horizontal:` / `data-vertical:` Tailwind variants, but `@base-ui/react@1.5.0` `Separator` renders **`data-orientation`** (state key `orientation` -> `getStateAttributesProps` lowercases state keys; no custom mapping). Neither variant matched, so a vertical separator had `h-5` and **0 width** (flex item, no content) and the color-picker section dividers had 0 height. Fixed in `packages/editor-ui/src/components/separator/separator.tsx` by targeting `data-[orientation=horizontal|vertical]` (only intentional deviation from the verbatim shadcn file, same category as the popover focus flags). Verified in the built CSS: `.data-\[orientation\=vertical\]\:w-px[data-orientation=vertical]{width:1px}`.
- **Active control state invisible in dark mode (both editors)** — root cause is a theme token collision, not the components: dark `--popover: oklch(0.269 0 0)` is identical to `--secondary` and `--muted` (shadcn's own dark theme uses `--popover: oklch(0.205 0 0)`, same as `--card`). `variant="secondary"` on a `bg-popover` surface therefore renders nothing. Restored the pre-migration look (`.bubble-btn--active { background: var(--accent) }`) with a shipped-CSS state hook instead of inline Tailwind per call site: `.block-editor-bubble-menu [data-active]` / `.rte-bubble-menu [data-active]` -> accent bg + accent-foreground, plus a hover mix. Triggers switched from `variant={active ? "secondary" : "ghost"}` to `variant="ghost"` + `data-active={active || undefined}` (+ `aria-pressed` on the text toggles, `aria-expanded` on the color/link popover triggers): block-editor text-buttons/color-selector/link-selector, editor text-buttons/color-selector.
- **Bubble bar layout** — restored the geometry the deleted primitives provided: separators got `mx-0.5` (was `margin: 0 0.125rem` on `.bubble-separator`) in both `bubble-menu/index.tsx`; node-selector label cap is back to 5rem (`max-w-20` on the span, dropped the looser `max-w-32` on the trigger). Buttons were already the right size (`icon-sm`/`sm` = 28px = old `1.75rem`).

## Shipped CSS audit (answers "what about the css the editors ship?")
- Both packages ship exactly one `style.css` and **both registry items include it** (`editor/style.css`, `block-editor/style.css` in `apps/web/public/r/*.json`), so registry consumers get it — they must still `import` it themselves.
- Dead-CSS audit (every selector in `style.css` vs. every class in the package `src`): no dead control CSS is left. Everything "unreferenced" is either runtime-generated (shiki/hljs `hljs-*`, `.ProseMirror`, `.is-editor-empty`, `.selectedCell`, `.tableWrapper`, `ProseMirror-selectednode`, `is-empty`, `language_`, `rte-/block-editor-theme-transitioning`) or a documented opt-in hook (`.rte-toolbar--compact`, `.rte-toolbar--subtle`, `.rte-task-list` — all listed in `docs/styling.mdx`, so kept).
- The split to hold going forward: **controls = Tailwind + shadcn tokens, CSS = layout shells + editor content + theme-able state hooks** (slash menu, color swatch grid, link input, bubble shell, `[data-active]`). The bubble-menu bugs above were all CSS/data-attribute level, which is exactly why the shells and state hooks stay in the shipped file.

## Verified
- `pnpm --filter @editorcn/{editor-ui,editor,block-editor} typecheck` clean; `node scripts/build-registry.mjs` re-run (separator + `data-active` present in the emitted items); `pnpm --filter web build` green.
- `styling.mdx` documents the `[data-active]` hook for both bubble menus.

## Decisions
- Dark `--popover: oklch(0.269 0 0)` in `packages/ui/src/styles/globals.css` == `--secondary` == `--muted` (shadcn's dark keeps `--popover` at `0.205` = `--card`). **User decision: leave the theme as-is** — the editors no longer depend on the invariant (accent-based active state), and darkening every popover/dropdown app-wide is not worth it. Watch item: any future shadcn component that paints `bg-muted`/`bg-secondary` on a popover surface will look inert here.

## Next
- Visual pass on /block-editor + /editor in dev; keep-or-revert question for `packages/ui/.../{switch,dropdown-pill}` still open; README note; any remaining changelog entry for the shared-package migration.

# 2026-09-29 — code-block extension reverted, roadmap re-scoped to editor-ui (session record)

## Decision
- The uncommitted Shiki `code-block` extension was **reverted**, docs and working-tree code. The shipped code block is the lowlight-based one that both editors already had. `@editorcn/editor-ui` migration is untouched by this revert.
- `docs/ROADMAP.md` re-scoped to `@editorcn/editor-ui` only. `PRD.md` / `ARCHITECTURE.md` stay repository-wide and factual. Code-block work is deferred, not scheduled.

## What was reverted
- Deleted `packages/extensions/src/code-block/`, its `manifest.json` entry, its `src/index.ts` exports, and its `package.json` entries; restored `packages/extensions/src/core/labels.ts` to drop the code-block labels. `@editorcn/editor-ui` dep and the removal of the legacy `./ui*` exports stayed (that was the shared-UI migration, not code-block work).
- Restored `packages/block-editor/src/extensions/code-block.ts` (lowlight), `icons.tsx`, `bubble-menu/utils.ts` language helpers, and the `CodeBlock` + `DEFAULT_LANGUAGE_ICONS` exports in `src/index.ts`; reintroduced `LanguageSelector` in the bubble menu.
- Restored `packages/editor/src/index.ts`'s `CodeBlock` export (the migration had dropped it, leaving `extensions/code-block.ts` as dead code while the docs still promised highlighting).
- Reverted the four demos: `(app)/block-editor/page.tsx`, `block-editor-preview.tsx`, `customization/block-editor-demos.tsx`, `customization/extensions/extension-previews.tsx`.
- Docs: restored `content/docs/block-editor/index.mdx` + `content/docs/extensions/meta.json`, deleted `content/docs/extensions/code-block.mdx`, and reverted only the code-highlight section of `content/docs/editor/index.mdx` (the Phase 3 bubble-menu/editor-ui sentence in the same file was kept).

## Caught by verification, not by reading the diff
- **The generator's hand-maintained lists had silently dropped three files.** `scripts/build-registry.mjs` was still missing `editor/extensions/code-block.ts`, `block-editor/extensions/code-block.ts`, and `block-editor/bubble-menu/language-selector.tsx`, so the emitted items imported files they did not ship — `index.ts` re-exported `./extensions/code-block` that was not in the file list. An installed item would not have compiled. Restored all three entries plus the four `lowlight` dependency lines (two per item).
- **The same applies to stale output.** `apps/web/public/r/code-block.json` survived the item removal because the generator never cleans its output dir (D10). It had to be deleted by hand. Verified gone.
- **Optional peers are not enough to typecheck.** Both `editor` and `block-editor` declare `@tiptap/extension-code-block-lowlight` / `lowlight` as `optional: true` peers (as at HEAD), which does not put them in `node_modules`; the block-editor typecheck failed until they were added to `devDependencies`. Applied the same fix to the editor package, whose `lowlight` had been moved into `dependencies` by the aborted migration.
- `packages/ui/src/components/kibo-ui/{code-block,theme-switcher}` and `packages/editor/src/bubble-menu/language-selector.tsx` were left alone: the first is a docs-site renderer, the second is the toolbar editor's own selector.
- **`packages/ui` is not as small as a directory listing suggests.** It holds 18 loose component files plus `kibo-ui/`; 10 share a name with an `editor-ui` primitive, and only `button.tsx` has an importer in `apps/web`. `switch.tsx` and `dropdown-pill.tsx` are unimported, so the keep-or-delete question from the previous session is still open rather than resolved.

## Registry state after the revert
- 5 items: `editor` 33 files/21 deps, `block-editor` 28/29, `static-renderer` 4/5, `image-placeholder` 18/8, `table` 14/12. No item emits `registryDependencies` (D9 stands).
- `editor-ui` flattens 8 of the 10 primitives; `checkbox` and `switch` are consumed by nothing, in this repo or any item.

## Docs
- `docs/ROADMAP.md` rewritten around editor-ui: package state, the per-item flattening table, and five proposed items (CLI regen path, `checkbox`/`switch` decision, duplicate-surface pass, focus audit in an installed item, `style.css` mirroring). Everything else moved to a deferred section.
- Corrected the six-item / 42-file claims in `PRD.md` (§4, §5, §8), `ARCHITECTURE.md` (§ package map, §7.1), and `CONTEXT.md` (glossary).
- `apps/web/content/docs/registry.mdx` counts (editor 42/21, block-editor 38/29) are still wrong — logged as D2, not fixed, per the drift-lists-not-fixes policy.

## Verified
- `pnpm install`, `pnpm typecheck` (7/7 tasks), `pnpm build:registry` all green.
- `pnpm check` still fails repo-wide on pre-existing formatting; not touched.
- Visual pass on `/editor` and `/block-editor` (port 3001) still not confirmed.

## Next
- editor-ui work per `docs/ROADMAP.md` §2. Code-block work stays deferred until explicitly picked back up.
