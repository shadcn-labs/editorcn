# PRD — editorcn

**Status:** living document. **Last verified:** 2026-09-29 (against `main` @ `e1f4cb4` plus the uncommitted shared-UI migration).
**Owner:** maintainers. **Scope of this file:** the product, not the implementation — see [ARCHITECTURE.md](./ARCHITECTURE.md) for how it is built.

---

## 1. Summary

editorcn is a free, MIT-licensed set of **rich text editor components for React**, distributed through the shadcn registry so that users end up **owning the source code** instead of a black-box dependency. It is built on Tiptap v3, themed by shadcn/ui design tokens, and ships four surfaces:

| Surface         | Package                                                                            | What it is                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Toolbar editor  | `@editorcn/editor`                                                                 | A classic Notion/Webflow-style editor: sticky toolbar, 30+ controls, text color + highlight, bubble menu, embeds |
| Block editor    | `@editorcn/block-editor`                                                           | A Notion-style block editor: slash commands, drag handles, per-block actions, bubble menu                        |
| Extensions      | `@editorcn/extensions` (registry items `image-placeholder`, `table`)                 | Optional Tiptap node extensions with Notion-grade UI (hover toolbars, resize handles, themeable)                 |
| Static renderer | `@editorcn/static-renderer`                                                        | Renders editor JSON or HTML to React/HTML for read-only surfaces (SSR, email, feeds)                             |

The differentiating bet is **not** the editor features — Tiptap already does that. It is the combination of (a) source ownership after install, (b) a visual language that is already the de-facto standard for shadcn users, and (c) a documented theme-token contract so the editor looks native in an existing app.

Sources: [`README.md`](../README.md), [`apps/web/content/docs/index.mdx`](../apps/web/content/docs/index.mdx), [`apps/web/content/docs/ownership.mdx`](../apps/web/content/docs/ownership.mdx).

## 2. The problem

A developer choosing an editor today faces three bad options:

1. **Raw Tiptap.** Maximum control, but you now own the toolbar, bubble menu, slash menu, link dialogs, color pickers, drag handles, focus behavior, and the CSS for all of it. The hard part of an editor is not the document model; it is the ~15 interaction surfaces around it.
2. **A hosted/proprietary editor** (Lexical-based SaaS, Notion-like SDKs). Works, but the data model and the UI are closed, pricing and licensing are somebody else's roadmap, and the design language does not match a shadcn app.
3. **A styled wrapper around a library** that re-exports components with hardcoded class names. It looks fine in the demo and fights your theme the moment you install it.

editorcn's answer: give the full interaction layer, in the user's own code, in the user's own theme.

## 3. Users and jobs to be done

| User                                                                     | Job                                           | What "good" looks like                                                                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| App developer adding a notes/docs/blog feature to an existing shadcn app | Get a good editor without designing one       | Installs one registry item, adds two peer deps, imports one CSS file, and the editor matches the app in light and dark mode |
| Developer with a bespoke UI language                                     | Make the editor _theirs_                      | Every control, class, and label is editable in their own repo; no upgrade overwrites their work silently                    |
| Library/tooling author                                                   | Describe or scrape editor content server-side | `static-renderer` turns stored JSON into HTML/React without a browser                                                       |
| Agent-driven developer                                                   | Understand and extend the editor              | Docs are machine-readable (`llms.txt`, `/api/mdx`, `.well-known` service links) and the source is in their tree             |

**Anti-persona:** teams that want a no-code page builder, collaborative multiplayer editing, or a plugin marketplace. Those are different products (see §7).

## 4. Product principles

These are the rules we use to settle arguments. They are deliberately few.

1. **The user owns the code.** Registry install copies source. Every decision that would push logic behind an opaque runtime boundary is a regression against this principle.
2. **The shadcn theme is the theme.** Colors, radius, and fonts come from the consumer's shadcn tokens. We do not ship a second theming system, and we do not hardcode hex values where a token exists.
3. **Zero config, but escape hatches everywhere.** It must work with no props. Every visual and textual element is overridable (`icons`, `labels`, `className`, CSS classes, `children`).
4. **Tiptap stays visible.** We compose Tiptap extensions and commands; we do not hide them behind an abstraction that would prevent a consumer from reaching the editor instance. The `editor` prop is the consumer's own Tiptap `Editor`.
5. **Docs are part of the product.** The docs site is not marketing; it is the install path, the API reference, and the agent surface. Behavior changes without a docs change are incomplete.
6. **Composition over configuration.** Prefer compound components (`BlockEditor.BubbleMenu`, `RichTextEditor.Toolbar`) and extension registration over a growing props object.

## 5. Scope

### In scope (shipped)

- **Two editors** with bubble menus, text color + highlight (with a "Recently Used" palette persisted to `localStorage`), and themable toolbars.
- **Slash commands** in the block editor, with a documented extension API (`getSlashCommandSuggestion`, per-item `icon`, keyword filtering).
- **Two node extensions**: image placeholder (upload/embed flow → resizable image) and table (grid picker, hover handles, row/column move, merge/split). Code blocks are not an extension — both editors ship a lowlight-based code block with syntax highlighting, a language picker, copy, and wrap.
- **A static renderer** for JSON/HTML content.
- **A registry** (`editor`, `block-editor`, `image-placeholder`, `table`, `static-renderer`) plus npm publishing for the three built packages.
- **A docs site** with live demos, a class reference, and agent-discoverable endpoints.
- **Theme contract**: a documented set of CSS custom properties, a class reference per editor, and a per-instance `className` escape hatch.

### Out of scope (deliberately)

- A full block/page builder with arbitrary node types out of the box.
- Multiplayer/collaboration as a built-in feature (the extension is not bundled; consumers add `@tiptap/extension-collaboration` themselves).
- Comments, suggestions, revision history, or any account/auth/backend concern. This is a component library, not a service.
- A runtime backend, database, or API (`bts.jsonc` records the stack: `backend: "none"`, `database: "none"`).
- Bundling a Tailwind/React/shadcn version — those are consumer prerequisites, declared as peers.

## 6. Requirements

### 6.1 Distribution

| #   | Requirement                                                                                          | Why                                             | Verified by                                                       |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| D1  | Installable via `npx shadcn@latest add @editorcn/editor` with source copied into the consumer's tree | Core product bet                                | `apps/web/public/r/editor.json`, docs `/docs/registry`            |
| D2  | Installable from npm as compiled `dist` + types, for consumers who prefer dependencies               | Some users cannot vendor source                 | `packages/*/package.json` `exports`                               |
| D3  | Every registry item ships its CSS as a `registry:style` file the consumer imports explicitly         | Content styling cannot be inlined as utilities  | `editor/style.css` in `editor.json` (31 component + 1 style file) |
| D4  | Registry items declare all runtime deps; peer deps stay external and are documented                  | Keeps `node_modules` correct after `shadcn add` | `dependencies` in each item JSON                                  |
| D5  | A published change is reflected in the served registry                                               | Single source of truth                          | `pnpm dev`/`pnpm build` run `scripts/build-registry.mjs` first    |

### 6.2 Editors

| #   | Requirement                                                                                     | Why                                          | Verified by                                                                     |
| --- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| E1  | Both editors accept a consumer-created Tiptap `Editor` and never recreate it                    | Ownership + control                          | `editor` prop in `packages/{editor,block-editor}/src/types.ts`                  |
| E2  | Bubble menu shows only for non-empty text selections, and hides when the editor is not editable | Avoids a floating toolbar in read-only views | `shouldShow` in both `bubble-menu/index.tsx`                                    |
| E3  | Interacting with the bubble menu must not steal the Tiptap selection                            | Prevents formatting the wrong text           | `onMouseDown={(e) => e.preventDefault()}` on triggers, menu items, and swatches |
| E4  | Popovers must not steal focus from the editor (node views depend on it)                         | Focus jumps break node-view interactions     | `initialFocus={false} finalFocus={false}` in `editor-ui` popover                |
| E5  | Active state (bold, color, link, heading) must be visible in **both** themes                    | It is the primary feedback of a toolbar      | `.block-editor-bubble-menu [data-active]`, `.rte-bubble-menu [data-active]`     |
| E6  | Every icon and every label is overridable, including per-extension items                        | Localization and brand                       | `icons` / `labels` props, `DEFAULT_ICONS`, `DEFAULT_BLOCK_EDITOR_LABELS`        |
| E7  | Slash command list is keyboard-driven (↑/↓/Enter/Esc) and accessible                            | It is a menu                                 | `suggestion-list.tsx` `role="listbox"`, `role="option"`, `aria-selected`        |
| E8  | Slash menu, link form, and color palette work when the required extension is absent             | Extensions are optional                      | `editor.extensionManager.extensions.some(...)` guards in `color-selector.tsx`   |

### 6.3 Theme and styling

| #   | Requirement                                                                                             | Why                                      | Verified by                                                 |
| --- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| T1  | Colors, radius, and fonts resolve to the consumer's shadcn tokens                                       | Native look                              | `--radius`, `--popover`, `--accent`, … in both `style.css`  |
| T2  | No component hardcodes a hex value where a token exists                                                 | Theme switching                          | audit in `CONTEXT.md` §7                                    |
| T3  | Controls are built from shadcn primitives; CSS is for content, layout shells, and themeable state hooks | One styling system, not two              | `packages/editor-ui` + `[data-active]` hooks                |
| T4  | Documented class reference for every public class                                                       | Users restyle without reading our source | `apps/web/content/docs/styling.mdx`                         |
| T5  | Light and dark are both first-class                                                                     | Default expectation                      | `.dark` token block in `packages/ui/src/styles/globals.css` |

### 6.4 Non-functional

| #   | Requirement                                    | Detail                                                                                         |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| N1  | React 18 or 19                                 | `peerDependencies: react ^18 \|\| ^19` in all published packages                               |
| N2  | Tiptap v3                                      | `>=3.0.0 <4` in package peers (registry items still say `>=2.11.5 <4` — see ROADMAP debt)      |
| N3  | Tailwind v4                                    | `@tailwindcss/postcss` in `apps/web`; consumers on the shadcn v4 setup                         |
| N4  | TypeScript strict                              | `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` in `packages/config/tsconfig.base.json` |
| N5  | Lint + format + typecheck gate every PR        | `.github/workflows/ci.yml` runs `pnpm check`, `pnpm build`, `pnpm typecheck`                   |
| N6  | No runtime dependency on the docs app          | The packages must not import from `apps/web`                                                   |
| N7  | MIT license, DCO sign-off, PR tied to an issue | `LICENSE`, `CONTRIBUTING.md`, `.github/dco.yml`                                                |

## 7. Non-goals (explicitly rejected)

| Rejected                                    | Why                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| Built-in collaboration                      | Requires a backend and sync authority; would turn a component library into a service |
| Plugin/marketplace system                   | Kills the source-ownership promise and adds a moderation surface we cannot staff     |
| A proprietary extension store or paid tier  | Conflicts with MIT and with principle 1                                              |
| Shipping our own Tailwind preset            | Consumers already have a theme; a second one is a conflict, not a feature            |
| Hiding Tiptap behind a document abstraction | Breaks E1 and every advanced use case (custom nodes, custom commands)                |

## 8. Success signals

There is no analytics in this repo, so these are the observable proxies we can actually check:

1. **Registry consumption** — `shadcn add` usage of the five items; the docs site is the only distribution telemetry we have.
2. **npm downloads** for `@editorcn/editor`, `@editorcn/block-editor`, `@editorcn/static-renderer`.
3. **Issue mix** — feature requests that stay in the Notion/Tiptap idiom (i.e. the abstraction is not fighting users).
4. **PR health** — the repo requires an agreed issue before implementation (`CONTRIBUTING.md`), so review latency and "do not send broad rewrites" rejections are the signal that scope discipline is working.
5. **Docs completeness** — no recurring "how do I…" issues that a docs page should have answered.

_Assumption:_ the maintainers' priority is a small, high-quality, dependency-light surface over feature count. Every "non-goal" above follows from that assumption. If the project shifts toward a hosted/enterprise direction, §7 and principle 1 must be renegotiated first.

## 9. Open questions

1. **Registry vs npm as the default story.** The docs recommend the registry, but the registry's dependency lists are hand-maintained (`scripts/build-registry.mjs`) and already drift from the packages. Deriving them from `package.json` would remove a class of bug — see ROADMAP.
2. **Tiptap floor.** Packages declare `>=3.0.0 <4`, registry items say `>=2.11.5 <4`, and the docs' Getting Started says `>=2.11.5 <4`. One number should win; today v3 is the real requirement (v2 paths are even still pinned in `apps/web/tsconfig.json`).
3. **Testing.** There is no test runner in the repo. The registry generator is the highest-value thing to test (it is a 774-line script with hand-written file lists and a silent no-op risk when a directory disappears). Whether to add tests is a roadmap call, not a PRD one.
4. **Extension authoring as a first-class flow.** Extensions are published by us from one package. Whether third parties can publish registry items that compose our core is undecided.
