/**
 * Shared `iconLibrary` type for the Rich Text Editor.
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
 * import { phosphorEditorIcons } from "@/components/editor/icons-phosphor";
 *
 * <RichTextEditor editor={editor} icons={phosphorEditorIcons} />;
 * ```
 */
export type EditorIconLibrary =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon";

/** npm packages required per icon library (mirrors the shadcn CLI). */
export const EDITOR_ICON_LIBRARY_PACKAGES: Record<EditorIconLibrary, string[]> =
  {
    hugeicons: ["@hugeicons/react", "@hugeicons/core-free-icons"],
    lucide: ["lucide-react"],
    phosphor: ["@phosphor-icons/react"],
    remixicon: ["@remixicon/react"],
    tabler: ["@tabler/icons-react"],
  };
