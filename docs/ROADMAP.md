# ROADMAP — `@editorcn/editor-ui` focus

**Last verified:** 2026-09-29. Status reflects `main` @ `e1f4cb4` plus the still-uncommitted shared-UI migration, after the `code-block` extension work was reverted. "Done" means verified by the listed evidence, not just merged.

## 0. Scope of this roadmap

This board covers **only** `@editorcn/editor-ui`: the shared component package, how it is flattened into registry items, and the contracts consumers depend on.

Everything else — code-block work, npm/release packaging, and the user-facing docs drift catalog — is **deferred** and listed in §6 so it is not lost, not scheduled here. `PRD.md` and `ARCHITECTURE.md` stay repository-wide and factual.

## 1. Where the package stands

`packages/editor-ui/src/components/` holds **10** shadcn base-nova primitives, folder-per-component, generated with the shadcn CLI:

| Consumed by ≥1 registry item | Currently unused |
| --------------------------- | --------------- |
| `button`, `dropdown-menu`, `input`, `popover`, `separator`, `dialog`, `tabs`, `toggle` | `checkbox`, `switch` |

`packages/ui/src/components/` is a separate, docs-site-only surface: 18 loose shadcn files plus `kibo-ui/{code-block,theme-switcher}`. Ten of the 18 share a name with an `editor-ui` primitive (`button`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `popover`, `separator`, `switch`, `tabs`, `toggle`). As of this writing the docs site imports exactly one of them — `button.tsx`, two importers — and the rest have no importer in `apps/web`. The older keep-or-revert question about `switch.tsx` and `dropdown-pill.tsx` is therefore still open: both are unimported.

### Flattening, as it stands in the generated output

`scripts/build-registry.mjs` copies each used primitive plus its intra-package imports into `editor-ui/*.tsx` and rewrites imports to `@components/editor-ui/*` and `@/lib/utils`. Actual per-item result:

| Item               | Files | Deps | Flattened editor-ui components                            |
| ------------------ | ----- | ---- | --------------------------------------------------------- |
| `editor`           | 33    | 21   | `separator`, `button`, `dropdown-menu`, `popover`, `toggle`, `input`, `dialog` |
| `block-editor`     | 28    | 29   | `button`, `separator`, `dropdown-menu`, `popover`          |
| `image-placeholder`| 18    | 8    | `button`, `input`, `popover`, `tabs`, `dropdown-menu`, `separator` |
| `table`            | 14    | 12   | `button`, `dropdown-menu`, `popover`                       |
| `static-renderer`  | 4     | 5    | none                                                       |

Catalog: 5 items, all `registry:component`. No item emits `registryDependencies` — the collect/resolve logic exists in the generator but produces nothing today (D9). `checkbox` and `switch` flatten into no item, which is the expected result of the import scan, not a bug.

## 2. Proposed next work (ordered by value / trivality)

1. **Regenerate from the CLI instead of by hand.** Every primitive in `editor-ui` is a shadcn CLI artifact, but re-adding one still means: generate into the package, then hand-fix the two recorded deviations. Make the deviation set a documented post-generation step (or a small script) so a regen is a single command. This is the highest-value item because every other change to the package goes through it.
2. **Decide `checkbox` and `switch`.** They are the only components no consumer uses. Either wire them into a real surface (task-list styling in the block editor is the obvious candidate) or delete them so the package does not advertise primitives nothing installs. Deleting is the cheaper correct answer today.
3. **Duplicate-surface review against `packages/ui`.** The docs site carries 18 loose component files, 10 named identically to an `editor-ui` primitive, and imports one of them. The cheap end state is deleting the unimported duplicates — but `dropdown-pill.tsx` and `switch.tsx` are the two that the open question in §3 already names, so decide those explicitly and record it in DECISIONS rather than sweeping them into a cleanup.
4. **Focus-behavior audit across flattened surfaces.** `Popover` keeps `initialFocus={false}` / `finalFocus={false}` and bubble-menu triggers `preventDefault()` in `onMouseDown` so Tiptap selection survives. Flattening copies the component, not that intent, so verify focus behavior in an _installed_ item rather than in this repo, where the same bug is masked by the workspace copy. `initialFocus`/`finalFocus` are the two props most likely to be dropped in a future regen.
5. **`style.css` mirroring check for editor-ui classes.** A class added to a primitive but not mirrored in the shipped `style.css` compiles in the demos and is invisible after install. Worth one pass per primitive that ships custom classes.

## 3. Open items

| #   | Item                                              | Where            | Status / resolution                                                          |
| --- | ------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| O1  | Keep or delete `packages/ui/.../{switch,dropdown-pill}.tsx` | `packages/ui` | Both are unimported. Deleting resolves it; keeping needs a stated consumer. Decision, not a cleanup. |
| O2  | Tell users editors depend on `@editorcn/editor-ui`| `README.md`      | Open, low stakes: flattening means the package is not required post-install.  |
| O3  | Changelog entry for the shared-UI migration        | `CHANGELOG.md`   | Deferred to the next release.                                                 |
| O4  | Visual/behavior confirmation on the demos          | `/editor`, `/block-editor` | Open. Not yet confirmed by the maintainer after the revert.        |
| O5  | Separate `/editor` playground route                | `apps/web`       | Open; not editor-ui blocking.                                                  |

## 4. Known debt and drift (log, not todo)

**Fix policy:** each is independent; fix them one at a time. Paths are where the lie lives today.

| #   | Drift                                                                            | Evidence                                                                                                                                       | Why it matters                                                                                          |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| D1  | `ownership.mdx` still shows the **deleted** `ui/` folder in the install tree     | `apps/web/content/docs/ownership.mdx` vs `scripts/build-registry.mjs` flattening helpers                                                    | Docs promise an install shape that no longer happens; `shadcn add` users will look for files that never appear |
| D2  | `registry.mdx` counts no longer match output                                     | docs claim editor 42 files/21 deps and block-editor 38/29; actual output is **33/21** and **28/29**                                            | Anyone scripting installs or verifying content against the docs gets wrong expectations                   |
| D3  | `@editorcn/block-editor` has **no `files` field**                                | `packages/block-editor/package.json`                                                                                                           | `pnpm publish` would ship `src/` + `tsconfig`; should be `files: ["dist"]`                               |
| D4  | `apps/web/tsconfig.json` hard-pins Tiptap **2.x** paths                          | `@tiptap/core: 2.27.2` + `@tiptap/pm: 2.27.2` under `paths`                                                                                     | Compiler resolves v2 types for paths used by docs examples while packages are v3                          |
| D5  | Registry dependency lists are hand-authored and older than package peers         | `scripts/build-registry.mjs` `dependencies` arrays (Tiptap `>=2.11.5 <4`) vs package peers (`>=3.0.0 <4`)                                     | A package bump is not reflected in what `shadcn add` installs. The generator already scans imports; extending it to manifests is mechanical |
| D6  | `packages/env` + `packages/config` are outside the turbo typecheck graph         | no `typecheck` script in either `package.json`                                                                                                  | `tsconfig.base.json` edits are never type-verified in CI                                                 |
| D7  | `pnpm-workspace.yaml` `allowBuilds: msw` and TS catalog mismatch                  | `msw@2.14.6` in the lockfile with no importer; catalog pins `typescript: ^6` while four packages pin `^5`                                       | Either msw is a stale allow-list entry or it is reachable; TS 5 vs 6 is unplanned divergence               |
| D8  | `packages/editor/tsconfig.json` alias is stale                                   | `"@editorcn/packages/editor/*"` path                                                                                                           | The old npm name no longer exists; agents resolving that path get a silent miss                           |
| D9  | `registryDependencies` supported but never emitted                               | `scripts/build-registry.mjs` resolver                                                                                                           | Dead code today: either wire items through it or drop it. Low urgency, items install flat by design      |
| D10 | Registry output dir is never cleaned                                              | `scripts/build-registry.mjs` write paths                                                                                                       | A deleted item leaves a stale `.json` in `apps/web/public/r/` that keeps being served                      |

D10 has already cost time once: the removed `code-block` item had to be deleted by hand after each rebuild.

## 5. Deferred, not scheduled

- `code-block` extension work, in any form. The Shiki-based extension was reverted; the shipped code block is lowlight-based in both editors.
- npm packaging and release: D3, O2, O3.
- Docs-truth pass for D1 and D2. Factual registry numbers are tracked in §1 here and in `ARCHITECTURE.md` until they are refreshed.
- `/editor` playground route (O5).

## 6. Prerelease checklist

1. Merge and verify the shared-UI branch cleanly; it is still uncommitted on `feat/code-block-extension`.
2. Resolve §2 items 1 and 2 so `editor-ui` has a single regeneration path and no unused primitives.
3. Decide the D5 derivation question so the `>=2.11.5 <4` vs `>=3.0.0 <4` mismatch cannot ship again.
4. Confirm the visual pass (O4). Optional: D8 tsconfig pins.

_Assumption:_ no date is committed externally; this list only names preconditions. ROADMAP is a status board, not a scheduler.
