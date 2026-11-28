// Icon libraries supported by the shadcn CLI; install only the set you use via its registry item.
export type BlockEditorIconLibrary =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon";

// npm packages required per icon library
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
