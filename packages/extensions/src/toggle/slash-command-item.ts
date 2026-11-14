import type { Editor, Range } from "@tiptap/core";
import { ChevronRight } from "lucide-react";
import { createElement } from "react";
import type { ReactNode } from "react";

export interface ToggleSlashCommandItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon?: ReactNode;
  command: (props: { editor: Editor; range: Range }) => void;
}

/**
 * Ready-made item for the `@editorcn/block-editor` slash command menu. Spread
 * it into the app's items next to `defaultSlashCommandItems`.
 */
export const toggleSlashCommandItem: ToggleSlashCommandItem = {
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setDetails().run();
  },
  description: "Hide content inside a collapsible section.",
  icon: createElement(ChevronRight),
  id: "toggle",
  keywords: [
    "toggle",
    "collapsible",
    "collapse",
    "details",
    "accordion",
    "fold",
  ],
  title: "Toggle",
};
