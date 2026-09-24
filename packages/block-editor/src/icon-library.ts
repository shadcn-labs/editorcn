/**
 * Shared `iconLibrary` type for the Block Editor.
 *
 * Mirrors the icon libraries supported by the shadcn CLI
 * (`npx shadcn@latest migrate icons --from lucide --to <target>`):
 * `lucide`, `tabler`, `hugeicons`, `phosphor` and `remixicon`.
 *
 * Each library (except the `lucide` default in `./icons.tsx`) ships a
 * preset in a sibling file so only the library you use needs to be
 * installed:
 *
 * - `./icons-phosphor.tsx` → `@phosphor-icons/react`
 * - `./icons-tabler.tsx` → `@tabler/icons-react`
 * - `./icons-hugeicons.tsx` → `@hugeicons/react` + `@hugeicons/core-free-icons`
 * - `./icons-remix.tsx` → `@remixicon/react`
 *
 * ```tsx
 * import { phosphorBlockEditorIcons } from "@/components/block-editor/icons-phosphor";
 *
 * <BlockEditor editor={editor} icons={phosphorBlockEditorIcons} />;
 * ```
 */
export type BlockEditorIconLibrary =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon";

/** npm packages required per icon library (mirrors the shadcn CLI). */
export const BLOCK_EDITOR_ICON_LIBRARY_PACKAGES: Record<
  BlockEditorIconLibrary,
  string[]
> = {
  hugeicons: ["@hugeicons/react", "@hugeicons/core-free-icons"],
  lucide: ["lucide-react"],
  phosphor: ["@phosphor-icons/react"],
  remixicon: ["@remixicon/react"],
  tabler: ["@tabler/icons-react"],
};
