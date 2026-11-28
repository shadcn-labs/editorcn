// Icon libraries supported by the shadcn CLI; install only the set you use via its registry item.
export type EditorIconLibrary =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon";

// npm packages required per icon library (mirrors the shadcn CLI)
export const EDITOR_ICON_LIBRARY_PACKAGES: Record<EditorIconLibrary, string[]> =
  {
    hugeicons: ["@hugeicons/react", "@hugeicons/core-free-icons"],
    lucide: ["lucide-react"],
    phosphor: ["@phosphor-icons/react"],
    remixicon: ["@remixicon/react"],
    tabler: ["@tabler/icons-react"],
  };
