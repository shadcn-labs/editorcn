# DECISIONS — architectural choices we made and why

**Last verified:** 2026-09-29. These are ADR-style entries distilled from [`JOURNAL.md`](../JOURNAL.md). **Status:** `accepted` for all listed entries.

---

## D1. Have a separate `@editorcn/editor-ui` package for shared controls

**Date:** 2026-09-27. **Area:** Package boundaries. **Source:** JOURNAL — "Phase 3: shared editor-ui package".

**Context**

The editor and block-editor each carried their own local `src/ui/` of shadcn/Base UI primitives. That caused duplication, drift (separator behavior varied between the two), and a harder registry build. We wanted one source of truth for controls without bloating `packages/ui` (the CLI scratchpad).

**Decision**

Create and use `@editorcn/editor-ui`: a folder-per-component set of shadcn primitives (button, checkbox, dialog, dropdown-menu, input, popover, separator, switch, tabs, toggle) consumed by both editors. In the registry, `editor-ui/*` is **flattened** into the consumer's tree rather than installed as a dependency.

**Consequences**

- Single implementation of focus behavior and separator rules.
- The registry must rewrite imports and recursively collect transitive components (D6).
- `packages/editor/src/ui/` and `packages/block-editor/src/ui/` were deleted. Historical changelog references to the old API were intentionally left unchanged.

---

## D2. editor-ui primitives are first-party code, not generated output

**Date:** 2026-09-27, revised 2026-09-29. **Area:** Controls. **Source:** JOURNAL — "Phase 3: shared editor-ui package".

**Context**

The primitives were originally generated with the shadcn CLI (base-nova), on the
assumption that they would be regenerated on a schedule and stay in lockstep with
upstream. That assumption did not hold: the components carry product-specific
behaviour (D4 focus flags, D8 separator attributes, the motion system added on
2026-09-29), so a regeneration would silently discard work rather than apply
upstream fixes. Treating generated code as canonical also made every intentional
deviation invisible.

**Decision**

`packages/editor-ui` is first-party source. The shadcn CLI is provenance, not the
workflow: components are edited in place, and there is no regeneration step. Keep
the folder-per-component shape (`<name>/<name>.tsx` + `index.ts`) and the upstream
API. Every deliberate divergence from upstream is recorded in the deviations table
below, so "is this ours or theirs?" is answerable without archaeology.

**Consequences**

- Upstream shadcn/Base UI fixes must be applied by hand. That is the cost, and it
  is paid deliberately.
- `pnpm check:editor-ui` asserts the behavioural contracts (D4, D8) that a
  regeneration would have broken, which is what makes hand-editing safe.
- `packages/ui` remains the CLI/docs scratchpad; `editor-ui` is the runtime-shared
  set. The 17 loose components in `packages/ui` with no importers were deleted.

### Deviations from upstream

| Component | Deviation | Why |
| --------- | --------- | --- |
| `popover` | `initialFocus={false}` `finalFocus={false}` | D4 — node views and bubble menus break if focus is stolen. |
| `separator` | `data-[orientation=…]` selectors | D8 — Base UI emits `data-orientation`, not `data-horizontal`. |
| `dialog`, `dropdown-menu`, `popover` | Motion reads CSS custom properties instead of literal `duration-*` values | Tokens are the only way to honour `prefers-reduced-motion` and let consumers retune timing. |
| `button`, `toggle`, `input`, `tabs` | `duration-(--editor-motion-duration-*)` on existing transitions | Same reason; these are transitions, not enter/exit animations. |
| `popover` | Uses `data-open`/`data-closed` animation states | The previous `animate-in … fade-out-0` had no `animate-out`, so exits never ran. |

---

## D2a. Motion is a token system in plain CSS, not Tailwind directives

**Date:** 2026-09-29. **Area:** Controls / styling. **Source:** discussion after the
editor-ui architecture review.

**Context**

npm consumers import `style.css` directly, with no Tailwind pipeline. An
`@theme` block or a custom `@utility` in a shipped stylesheet is invalid CSS in
that path and is silently dropped, so tokens had to be plain custom properties.
`prefers-reduced-motion` also had to work without adding a `motion-reduce:`
variant to every animated class.

**Decision**

Declare `--editor-motion-duration-{fast,base,slow}` and
`--editor-motion-ease-{standard,entrance,exit}` on `:root` in plain CSS, and zero
the durations inside a `prefers-reduced-motion: reduce` block. Components reach
them through Tailwind's arbitrary-value syntax
(`duration-(--editor-motion-duration-base)`). Motion uses tw-animate-css
utilities only — no bespoke keyframes. The canonical token block lives in
`packages/editor-ui/src/styles/motion.css` and is injected into every shipped
stylesheet by `pnpm sync:styles`.

**Consequences**

- Reduced motion is free: a new animated component inherits it with no extra
  markup, and a consumer can set the tokens to `0ms` to disable motion outright.
- Adding a stylesheet that ships animated components means running
  `pnpm sync:styles`; `pnpm check:editor-ui` fails if the block is missing.
- The theme-switch suppression rules now also cancel `animation`, not just
  `transition`, since tw-animate-css enters via keyframes. Note that neither
  `.rte-theme-transitioning` nor `.block-editor-theme-transitioning` is currently
  applied anywhere, so the rules are inert until a theme switch wires them up.

---

## D3. Menu primitives stay verbatim; accept focus-to-first-item

**Date:** 2026-09-27. **Area:** Focus. **Source:** JOURNAL — "Popover focus" analysis.

**Context**

Opening a shadcn/Base UI menu focuses the first item. That is Base UI's default and matches platform expectations for conventional menus.

**Decision**

Keep the official shadcn `dropdown-menu` and menu-based primitives verbatim. Do not override menu focus behaviour.

**Consequences**

- Zero divergence on the most complex primitive we ship.
- The slash command list is a different surface (D5) and is unaffected.

---

## D4. Popovers must not steal focus from the editor

**Date:** 2026-09-27. **Area:** Editor interaction. **Source:** JOURNAL — "Popover focus".

**Context**

Node views and Tiptap's selection/caret model break when a popover autofocuses on open. The user loses the caret and cannot keep typing in the block they were in.

**Decision**

Every popover keeps `initialFocus={false}` and `finalFocus={false}`, and bubble-menu triggers prevent default on `onMouseDown` so the selection survives interacting with the menu. Enforced in `packages/editor-ui/src/components/popover/popover.tsx` and the bubble-menu triggers.

**Consequences**

- No focus jumps when opening the colour, link, or alignment panels.
- Side effect: menu buttons never receive DOM focus, so state must be expressed via attributes (`data-active`), not focus/hover styling (see D7).

---

## D5. The slash menu stays a custom inline surface

**Date:** 2026-09-27. **Area:** UI surface. **Source:** JOURNAL — "Phase 3: slash command migration".

**Context**

Tiptap's `@tiptap/suggestion` owns keyboard navigation and positioning. Rebuilding the slash list inside the generic DropdownMenu would couple suggestion state to menu focus semantics and make keyboard behaviour harder to reason about.

**Decision**

Keep a custom rendered surface — `packages/block-editor/src/extensions/slash-command/suggestion-list.tsx` — with `role="listbox"` / `role="option"`, `aria-selected`, and explicit ↑/↓/Enter/Esc handling. It is emitted into the consumer's own tree as `block-editor/extensions/slash-command/…` (`scripts/build-registry.mjs:312-335`).

**Consequences**

- Keyboard behaviour stays predictable and tied to the suggestion API.
- The block-editor registry item ships the whole slash implementation (26 files), consistent with source ownership.

---

## D6. The registry flattens `@editorcn/editor-ui` with explicit import rewrites

**Date:** 2026-09-27. **Area:** Distribution. **Source:** `scripts/build-registry.mjs:23-50`, `:52-70`, `:440-459`.

**Context**

Registry consumers should not install `@editorcn/editor-ui` as an npm dependency — that breaks the ownership story and couples versions. But the primitives import each other (`../button` from `dropdown-menu`).

**Decision**

`collectEditorUi(name, out)` recursively discovers every primitive a shipped file imports, rewrites `cn` → `@/lib/utils`, rewrites sibling relative imports to `@components/editor-ui/$1.tsx`, and emits each primitive at `@components/editor-ui/<name>.tsx`. `rewriteEditorUiImports` then rewrites any remaining `@editorcn/editor-ui/components/` and `/lib/` references in shipped source to consumer aliases. The extension items use the same technique for `@editorcn/ui/components/` → `@components/extensions/ui/`.

**Consequences**

- Installed apps run with zero transitive workspace UI dependencies.
- The collector depends on a regex over import statements (`from "../[a-z-]+"`), so a non-matching import shape would be silently missed — a known sharp edge, see ROADMAP item 1 (test the generator).

---

## D7. Active state is a shipped-CSS `[data-active]` hook, not a button variant

**Date:** 2026-09-27. **Area:** Theming. **Source:** JOURNAL — "Phase 3: active state" and the bubble-menu polish entry.

**Context**

Using `variant="secondary"` to mean "this formatting is currently applied" overloads a visual variant that also means "secondary action", and it rendered poorly on dark surfaces. Consumers need one place to restyle editor state, and the shipped `style.css` already owns theme-aware hooks.

**Decision**

Express active state as DOM state — `data-active` on the trigger — and style it only in the shipped CSS: `.block-editor-bubble-menu [data-active]` and `.rte-bubble-menu [data-active]` use `--accent` / `--accent-foreground`. Triggers keep `variant="ghost"` as their base look. ARIA state (`aria-pressed`, `aria-selected`) stays correct at the component level.

**Consequences**

- Active state is visible in both themes without fighting the variant system.
- Theming an editor is a CSS override, not a props change — which is the contract the styling docs describe.
- Documented for users in `apps/web/content/docs/styling.mdx`.

---

## D8. Separator is the one intentional deviation from shadcn verbatim

**Date:** 2026-09-27. **Area:** Primitives. **Source:** `packages/editor-ui/src/components/separator/separator.tsx`.

**Context**

`@base-ui/react` 1.5 emits `data-orientation="horizontal|vertical"`, while the generated shadcn separator CSS targeted `[data-horizontal]` / `[data-vertical]`. Nothing matched, so separators were invisible. The block editor bubble menu also needed consistent horizontal margins.

**Decision**

Style the primitive against `[data-orientation=horizontal]` / `[data-orientation=vertical]`, and give the block editor's separator layout margins (`mx-0.5`, via the `data-[orientation]` wrapper). Keep the rest of the primitive API identical to shadcn base.

**Consequences**

- Separators render in both editors. The bubble menu layout fix (margins + capped node-selector label width) shipped in the same pass.
- **This patch must be re-applied after any shadcn regeneration** (D2). Treat it as a required post-generate step, not an optional one.

---

## D9. Dark `--popover` stays at `oklch(0.269 0 0)`

**Date:** 2026-09-27. **Area:** Theme tokens. **Source:** JOURNAL — "dark theme popover" entry.

**Context**

In dark mode `--popover` currently matches `--secondary` and `--muted`, which looks unconsidered to a reviewer. Changing it would ripple across every editor surface and the demos.

**Decision**

Leave it. The editor chrome was tuned against this value; aligning it is a visual redesign, not a bug fix, and nobody asked for it.

**Consequences**

- The colour similarity is intentional. A future PR that "fixes" it should be pointed here first.
- If the token is ever changed, it is a theming change with its own decision record and a visual pass on every surface.

---

## D10. Native inputs for the link and slash search fields

**Date:** 2026-09-27. **Area:** Accessibility. **Source:** JOURNAL — bubble-menu polish entry.

**Context**

Custom input-like divs break IME, screen readers, and copy/paste — painful in an editor, where users paste URLs constantly.

**Decision**

Use real `<input>` elements for the link form (and any search input in the slash flow), and do not call `.focus()` imperatively to "fix" ordering. The base appearance comes from the shadcn `Input` primitive with class overrides.

**Consequences**

- Correct keyboard, IME, and assistive-tech behaviour for free.
- Styling is a className override, consistent with the rest of the bubble menu.

---

## How to change a decision

1. Do not silently revert. Add a new entry at the top of this file with the same structure, set the old entry to `superseded by D<n>`, and write both the reason and the user-visible consequence.
2. Decisions that touch shipped behaviour (D4, D7, D8, D9) additionally require a line in `apps/web/content/docs` if the user can observe the difference.
3. `JOURNAL.md` stays the chronological record; this file is the distilled, current answer. When they disagree, the code plus the newest journal entry wins, and this file is corrected in the same PR.
