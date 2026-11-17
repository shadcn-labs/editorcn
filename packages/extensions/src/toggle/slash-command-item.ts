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

/** Slash command item for the `@editorcn/block-editor` menu. */
export const toggleSlashCommandItem: ToggleSlashCommandItem = {
  command: ({ editor, range }) => {
    if (!editor.can().setDetails()) {
      return;
    }
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
