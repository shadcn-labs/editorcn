# Context

Durable architectural context for editorcn. Read this before touching package boundaries or the
shared UI layer. For the chronological log of work, see [journal.md](./journal.md).

## What this repo is

A pnpm + Turborepo monorepo publishing TipTap-based rich text editors, plus a documentation site
that doubles as the shadcn-registry source of truth.

| Package | Published | Ships | Purpose |
| --- | --- | --- | --- |
| `@editorcn/editor` | yes | `dist` + `style.css` | Classic rich text editor (toolbar, bubble menu, embeds) |
| `@editorcn/block-editor` | yes | `dist` + `style.css` | Notion-style block editor (slash commands, drag handle) |
| `@editorcn/extensions` | no (private) | source only | Optional extensions: table, image-placeholder |
| `@editorcn/editor-ui` | yes | `dist` + `style.css` | **Being created.** Shared UI components |
| `@editorcn/ui` | no (private) | source only | The web app's own design system. **Not** a dependency of any editor |
| `@editorcn/static-renderer` | yes | `dist` + `style.css` | TipTap JSON → static HTML |
| `@editorcn/config` | no (private) | tsconfig base | Shared tsconfig |

`packages/ui` is the docs site's design system. Editors and extensions must never import it — they
are published packages and must work in a consumer app that has no `@editorcn/ui` at all.

## The problem being solved

Three packages each ship their own private `ui/` folder containing near-identical components under
three different class prefixes. Nothing is shared, so every bug fix and every animation tweak gets
applied three times, and the three copies have already drifted apart.

| Shape | `editor` | `block-editor` | `extensions` |
| --- | --- | --- | --- |
| bubble button | `RteButton` | `BubbleButton` | `Button` |
| button group | `RteButtonGroup` | `BubbleButtonGroup` | — |
| dropdown + hover pill | `RteDropdown` | `BubbleDropdown` | `DropdownMenuContent` + `useDropdownPill` |
| dropdown item | `RteDropdownItem` (`active`) | `BubbleDropdownItem` (`active`, `danger`) | `DropdownMenuItem` (`danger`) |
| dropdown divider | `RteDropdownDivider` | `BubbleDropdownDivider` | `DropdownMenuSeparator` |
| dropdown icon | `RteDropdownIcon` | `BubbleDropdownIcon` | — |
| full-screen overlay | `RteOverlay` | `DropdownOverlay` | — |
| color swatch | `RteColorSwatch` | `ColorSwatch` | — |
| icon wrapper | `RteIcon` | — | — |
| separator | `RteSeparator` (vertical only) | `BubbleSeparator` | `Separator` (h + v) |
| slash-menu shell | — | 5 components | — |
| popover / input | Base UI + cva + Tailwind | raw `<input>` | hand-rolled floating |
| tabs | — | — | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |

Class prefixes: `rte-*` (editor), `block-editor-*` (block-editor), `ext-*` (extensions).

Non-component code is duplicated too, and is byte-identical in places:

- `cn` — `editor/src/ui/utils.ts` and `block-editor/src/lib/utils.ts` are the same 5 lines.
- `useEditorState` + `shallowEqual` — first 79 lines of both `bubble-menu/utils.ts` files match.
- `CODE_BLOCK_LANGUAGES` and its labels — identical in both `bubble-menu/utils.ts` files.
- `extensions/code-block.ts` — identical in both editors.
- `TEXT_COLORS` / `HIGHLIGHT_COLORS` — identical in both `color-selector.tsx` files.
- `RteDropdown` / `BubbleDropdown` / `useDropdownPill` — same hover-pill logic, three times.

Deliberately **not** consolidating the tiptap-coupled helpers (`useEditorState`, `CODE_BLOCK_LANGUAGES`,
`code-block.ts`): sharing them would give `editor-ui` a `@tiptap/core` dependency, and it is meant to
stay React-only so `block-editor` and `extensions` never inherit editor machinery.

## Styling tiers

Every component in the repo is one of two tiers. Conflating them is the main design risk.

**Tier B — plain CSS, shadcn variables.** One class per element, hand-written rules, no Tailwind, no
Base UI. This is what `extensions` is 100% built from, and what all of `block-editor` and most of
`editor` uses. Styling comes from the consumer's shadcn variables (`--popover`, `--border`,
`--accent`, `--primary`, `--radius`, `--destructive`, `--ring`, `--muted-foreground`). Dark mode is
`@media (prefers-color-scheme: dark)`, not a class or attribute. Example: `RteButton` emits
`rte-bubble-btn` plus `rte-bubble-btn--active` and nothing else.

**Tier A — Base UI + `class-variance-authority` + Tailwind.** Only in `editor/src/ui/`, only 5 files:
`button.tsx`, `toggle.tsx`, `dialog.tsx`, `input.tsx`, `popover.tsx`. Styling is inline Tailwind
utility strings, variants come from `cva` scales, and elements carry `data-slot` attributes. These
five are being rewritten into Tier B.

`data-slot` attributes are part of the public API and must survive the rewrite.

### Which Tier A primitives are actually used

Verified by import-site audit, not assumed:

| Primitive | Call sites | Used by |
| --- | --- | --- |
| `Toggle` | 28 | 27 `createControl` instances in `controls/rte-controls.tsx` (via `RichTextEditorControl`), plus `controls/rte-link-control.tsx` |
| `Dialog` family (10 exports) | ~24 | `controls/rte-twitter-control.tsx`, `controls/rte-youtube-control.tsx` |
| `Input` | 3 | link control, twitter control, youtube control |
| `Popover` / `PopoverTrigger` / `PopoverContent` | 3 | `controls/rte-link-control.tsx` only |
| `Button` | 1 | `controls/rte-link-control.tsx` only |
| `buttonVariants` | 0 | exported from the barrel, never consumed |
| `toggleVariants` | 0 | exported from the barrel, never consumed |

`PopoverHeader` / `PopoverTitle` / `PopoverDescription` are exported but unused. Keep them for API
parity anyway.

### `render` prop call sites

`render` is Base UI's "compose into an existing element" API. It appears in only three places
externally:

| Site | Child it renders into | Child forwards a ref? |
| --- | --- | --- |
| `rte-link-control.tsx:73` | `PopoverTrigger render={<Toggle/>}` | yes |
| `rte-twitter-control.tsx:393` | `DialogTrigger render={<RichTextEditorControl/>}` | **no** |
| `rte-youtube-control.tsx:188` | `DialogTrigger render={<RichTextEditorControl/>}` | **no** |

`DialogClose`'s `render` is used only inside `ui/dialog.tsx` itself (lines 61 and 103, for the
`showCloseButton` affordances).

The asymmetry in that third column matters. `PopoverTrigger` clones a `Toggle`, which forwards its
ref, so a merged ref lands on a real `<button>`. `DialogTrigger` clones `RichTextEditorControl`,
which is a plain function component that neither accepts a `ref` prop nor spreads its rest props
onto the `Toggle` it renders — so a naive `cloneElement` ref merge is silently dropped there. The
rewrite must not assume the child is ref-forwarding, or the embed dialogs lose their trigger anchor
for focus restoration.

## Constraints that are easy to miss

### The registry is hand-enumerated

`scripts/build-registry.mjs` builds the shadcn copy-paste registry by reading individual files out of
`packages/<pkg>/src/` and mapping them to `@components/...`. File lists are literal arrays
(`editorFiles` at line 15, `blockEditorFiles` at line 230, `extensionCoreFiles` at line 488) plus a
`collectUiComponents` helper around line 551 that reads `packages/extensions/src/ui`.

Any file that moves must be re-registered by hand, or the published registry silently ships a broken
install. There is also a content rewriter, `rewriteExtensionsContent` (line 546), that maps
`@editorcn/ui/components/` onto `@components/extensions/ui/`; a new package needs an equivalent.

This is why `editor-ui` cannot be private: the registry copies source files, so the package is not
just a build artifact.

### Unlayered CSS beats Tailwind utilities

The app loads Tailwind v4 via `@import "tailwindcss"` in `packages/ui/src/styles/globals.css:1`,
which declares the `theme, base, components, utilities` cascade layers. But `editor/src/style.css`
is imported as a **separate, unlayered** stylesheet.

Unlayered author CSS wins over every `@layer`, including `utilities`. So any plain rule written into
`editor/src/style.css` will override a Tailwind utility passed at a call site. Five call sites depend
on that override surviving:

- `controls/rte-link-control.tsx:86` — `<PopoverContent className="w-72 p-3">`
- `controls/rte-link-control.tsx:79` — `<Toggle className="p-0">`
- `controls/rte-link-control.tsx:95` — `<Input className="rte-link-editor-input h-8 text-sm">`
- `controls/rte-link-control.tsx:101` — `<Button className="rte-link-editor-save h-8">`
- `controls/rte-youtube-control.tsx:233` — `<DialogClose className="rounded-md bg-primary px-3 py-1.5 …">`

Consequence: new Tier B primitive rules go inside `@layer components { … }` in `editor/src/style.css`.
For consumers running no Tailwind, a lone `@layer components` block still applies normally and
unlayered consumer CSS still overrides it.

### The monorepo resolves workspace packages to source

`apps/web/tsconfig.json` maps `@editorcn/editor`, `@editorcn/editor-ui` (to be added),
`@editorcn/block-editor`, and `@editorcn/ui` to their `src/` directories, and
`apps/web/next.config.mjs` lists `@editorcn/extensions` and `@editorcn/editor` in
`transpilePackages` so their TSX gets compiled. Follow the same pattern for any new package: a
`paths` entry in every consumer's tsconfig plus a `transpilePackages` entry for the web app.

`@editorcn/block-editor` is absent from `transpilePackages` even though web maps it to source. Not
something to fix here, but do not assume the list is exhaustive.

### CSS is entangled with component CSS

The two editors keep one flat `style.css` each, and the component rules are not cleanly separable
from the editor-specific ones. Examples: `.block-editor-color-section`, `-label`, `-grid`, `-recent`
back block-editor's private `ColorGroup` component, not the shared `ColorSwatch`; `.rte-editor-icon`
is applied by callers in `bubble-menu/text-buttons.tsx`, `bubble-menu/color-selector.tsx`,
`bubble-menu/language-selector.tsx`, `controls/rte-twitter-control.tsx`,
`controls/rte-youtube-control.tsx`, and `icons.tsx` — none of which are the primitives themselves.
Splitting the stylesheets means surgically separating ~250 shared lines per package with no tests to
catch a dropped animation.

Therefore: **CSS does not move in the first phase.** Components move to `editor-ui` while their
class rules stay exactly where they are. Moving CSS is phase 2, together with unifying the prefixes.

## The plan

### Phase 1 — rewrite the 5 Tier A primitives in plain CSS

Same files, same exports, same prop types, same `data-slot` values. No `@base-ui/react`, no `cva`, no
Tailwind classes. Classes follow the existing `rte-` convention. Appended to
`@layer components` in `editor/src/style.css`.

The rewrite must preserve:

- `Toggle`'s `pressed` / `defaultPressed` / `onPressedChange` contract on
  `<button type="button" aria-pressed>`, and a `forwardRef` — `PopoverTrigger render={<Toggle/>}`
  clones the child and merges a ref into it, so a non-forwarding ref breaks the link popover.
- `Popover`'s `render` prop: clone the child element and merge ref, `onClick`, `aria-expanded`,
  `aria-haspopup`. Must tolerate a child that cannot hold a ref.
- `Dialog`'s `render` prop on `DialogTrigger` and `DialogClose`, plus `showCloseButton` on
  `DialogContent` and `DialogFooter`.
- `DialogClose`'s unstyled-by-default behavior — `rte-youtube-control.tsx:233` relies entirely on
  Tailwind utilities to style it, so the CSS-only version must not paint a default background.
- Full `Dialog` behavior: portal, overlay, `role="dialog"`, `aria-modal`, focus trap, focus restore,
  scroll lock, Escape, outside click. There is no hand-rolled dialog in the repo to copy from; the
  positioning half can reuse `extensions/src/ui/use-floating.tsx`.
- `buttonVariants` / `toggleVariants` as plain `cn()` helpers with the same call signature, even
  though nothing consumes them, to avoid an API break.

Animation timings and easings (`duration-100`, `cubic-bezier(0.22, 1, 0.36, 1)`) carry over
verbatim. The conversion is a transcription of the existing Tailwind strings, not a redesign:
`bg-black/10` → `rgb(0 0 0 / 0.1)`, `zoom-in-95` → a `scale(0.95)` keyframe, `ring-1
ring-foreground/10` → `color-mix` outline, `data-open:` / `data-closed:` → `[data-open]` /
`[data-closed]`, `dark:` → the file's existing `prefers-color-scheme` block.

### Phase 2 — move the components

Scaffold `packages/editor-ui`. Move 45 files verbatim, no renames:

- `editor/src/ui/*` (17) → `editor-ui/src/editor/ui/*`
- `block-editor/src/ui/*` (15) → `editor-ui/src/block-editor/ui/*`
- `extensions/src/ui/*` (13) → `editor-ui/src/extensions/ui/*`
- plus one shared `editor-ui/src/lib/cn.ts`, re-exported from each group barrel

Exports are three subpaths plus `cn`. No root barrel, so importing the block-editor or extensions
group never pulls in editor machinery.

### Phase 3 — rewire consumers and the registry

Add the workspace dependency to all three packages, rewrite ~30 import lines, add tsconfig `paths`
and a `transpilePackages` entry, and update `scripts/build-registry.mjs`: drop the 32
`editor/ui/*` + `block-editor/ui/*` entries, add an `editorUiFiles` array, repoint
`collectUiComponents` at `packages/editor-ui/src/extensions/ui`, and extend the content rewriter.

Because Tier A is gone, `editor` drops `@base-ui/react`, `class-variance-authority`, `clsx`, and
`tailwind-merge`.

## Decisions

| Decision | Rationale |
| --- | --- |
| `editor-ui` is published, not private | The registry copies source files; a private package cannot serve both consumers and the registry |
| One subpath per consumer, no root barrel | Keeps `block-editor` / `extensions` free of editor machinery |
| Phase 1 moves components only, not CSS | Phase 2 unifies prefixes; moving CSS now is churn with no gain and real animation-regression risk |
| CSS for the 5 primitives lands in `editor/src/style.css` under `@layer components` | Preserves the four call sites that override via Tailwind utilities; matches the stated plan to ship a CSS per editor later |
| Public API of the 5 primitives stays byte-identical | ~30 call sites in `editor` need zero changes, so the toolbar and dialogs keep their current behavior |
| Prefixes stay unmerged (`rte-*`, `block-editor-*`, `ext-*`) for now | A pure move cannot lose animations; unification is a separate, deliberate pass |
| tiptap-coupled helpers stay put | Keeps `editor-ui` React-only |

## Open questions

- Whether `radix-ui` and `@floating-ui/dom` in `apps/web/package.json` are used by the web app
  itself. Left alone deliberately — unrelated cleanup should not ride along with this change.
- `buttonVariants` and `toggleVariants` are dead exports. Kept for now, safe to delete later.
- Whether `editor-ui` should eventually also own the shared `useEditorState` / `shallowEqual` /
  `CODE_BLOCK_LANGUAGES`. Blocked on `editor-ui` staying tiptap-free.
