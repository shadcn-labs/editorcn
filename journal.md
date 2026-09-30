# Journal

Chronological log of work on the shared UI layer. For durable architectural context, see
[context.md](./context.md). Newest entry at the bottom of each section.

---

## 2026-09-30 — Investigation

### Goal

`packages/editor-ui/` exists on disk but is completely empty — no `package.json`, no source. The
intent is to consolidate the UI components that `editor`, `block-editor`, and `extensions` each ship
privately into one shared package.

### What was audited

- Full file listing of `editor/src`, `block-editor/src`, `extensions/src`.
- Every component-like file in all three packages, with exported names and rendered structure.
- The styling approach of each package and the CSS custom properties each consumes.
- Import sites of all five Tier A primitives, to find out whether they are actually load-bearing.
- `scripts/build-registry.mjs`, `turbo.json`, `next.config.mjs`, and every package's `tsconfig.json`.

### Findings

**The duplication is real and has already drifted.** The three `ui/` folders implement the same
components under three prefixes (`rte-*`, `block-editor-*`, `ext-*`). The copies have diverged:
`BubbleDropdownItem` has a `danger` prop that `RteDropdownItem` lacks; `RteDropdown` calls its
variant prop `variant` while `BubbleDropdown` calls the same thing `align`; `RteSeparator` is
vertical-only while `Separator` supports both axes. Non-component code is worse — `cn`,
`useEditorState`/`shallowEqual`, `CODE_BLOCK_LANGUAGES`, the color palettes, and
`extensions/code-block.ts` are byte-identical across packages.

**Two styling tiers are in play, and only one package uses both.** `extensions` is 100% plain CSS
over shadcn variables; `block-editor` is the same; `editor` mixes that with 5 files built on
`@base-ui/react` + `class-variance-authority` + inline Tailwind strings. Conflating the tiers is the
main design risk in this refactor.

**The Tier A primitives are used, but narrowly.** All five have live call sites — `Toggle` in 28
places (27 toolbar controls plus the link control), `Dialog` in ~24 (both embed dialogs), `Input` in
3, `Popover` in 3, `Button` in 1. So they cannot simply be deleted. But `buttonVariants` and
`toggleVariants` are exported from the barrel and consumed nowhere.

**`render` is used in only three external places, and the two patterns differ in a way that
matters.** `rte-link-control.tsx:73` renders a `Toggle` into `PopoverTrigger`, and `Toggle` forwards
its ref, so a merged ref lands on a real `<button>`. `rte-twitter-control.tsx:393` and
`rte-youtube-control.tsx:188` render `RichTextEditorControl` into `DialogTrigger`, and that component
is a plain function component which neither accepts a `ref` prop nor spreads its rest props onto the
`Toggle` it renders. A naive `cloneElement` ref merge is silently dropped for the embed dialogs, which
would cost them their focus-restoration anchor. Flagged as a specific trap for the rewrite.

**There is no hand-rolled dialog anywhere in the repo to copy from.** `extensions` hand-rolled a
popover (`use-floating.tsx`), so the positioning half has a model, but the dialog — focus trap,
focus restore, scroll lock, `aria-modal` — has to be written from scratch. This is the single
highest-risk item in the plan.

**The registry is hand-enumerated, which constrains packaging.** `build-registry.mjs` reads
individual source files out of `packages/<pkg>/src/` via literal file arrays and maps them to
`@components/...`. A new package cannot be private, because the registry copies source rather than
consuming a build artifact. It also means every moved file must be re-registered by hand.

**CSS cannot be cleanly separated from component CSS.** `.block-editor-color-section`, `-label`,
`-grid`, and `-recent` back block-editor's private `ColorGroup`, not the shared `ColorSwatch`.
`.rte-editor-icon` is applied by callers in the bubble menu, the toolbar controls, and `icons.tsx`.
Separating the stylesheets would mean surgically excising ~250 shared lines per package with no tests
to catch a dropped animation.

**One cascade hazard was found and it is not obvious.** The web app loads Tailwind v4, but
`editor/src/style.css` is imported as a separate *unlayered* stylesheet. Unlayered author CSS beats
every `@layer`, including `utilities` — so any plain rule added to `style.css` will silently override
Tailwind utilities passed at a call site. Five call sites depend on exactly that: four in
`rte-link-control.tsx` (`w-72 p-3`, `p-0`, `h-8 text-sm`, `h-8`) and one in
`rte-youtube-control.tsx:233`, where a `DialogClose` is styled *entirely* by Tailwind utilities and
would need a default background painted on it by accident. New primitive rules must go inside
`@layer components`.

### Decisions taken

1. Move components verbatim first, unify the class prefixes in a later pass. The reason for doing it
   in this order is that the editors carry a lot of animation and micro-interaction work, and a pure
   file move cannot lose any of it.
2. Rewrite the 5 Tier A primitives into plain CSS rather than dropping base-ui, because all five have
   live call sites.
3. Keep the 5 primitives' public API byte-identical so the ~30 call sites in `editor` need zero
   changes and the toolbar/dialog behavior cannot regress.
4. Leave all existing CSS where it is. The 5 rewritten primitives append to
   `editor/src/style.css` under `@layer components`; everything else keeps its current home.
5. Publish `@editorcn/editor-ui` rather than bundling it, since the registry needs real source files.
6. Consolidate the components plus `cn` and the slash-menu primitives. Leave the tiptap-coupled
   helpers in place so `editor-ui` stays React-only.

### State

Investigation complete, no code written yet. `packages/editor-ui/` is still empty. Next step is
Phase 1: rewrite the 5 Tier A primitives in plain CSS, with `editor/src/style.css` gaining a
`@layer components` block.

---

## Verification log

Appended as each phase lands. Commands that must pass:

| Command | What it covers |
| --- | --- |
| `pnpm typecheck` | TypeScript across all packages, including the new one |
| `pnpm build` | tsup builds plus the docs app and the registry |
| `pnpm check` | ultracite lint and format |

The repo has no test suite, so the visual regressions worth watching are manual:

- the 28-button toolbar (`Toggle`, pressed state, disabled state)
- the link popover (`render` prop on `PopoverTrigger`, `Toggle` ref merge, `Input`, `Button`)
- both embed dialogs (portal, overlay, Escape, outside click, focus return, `showCloseButton`)
- the bubble-menu dropdown hover pill, since `RteDropdown` and `BubbleDropdown` both move
