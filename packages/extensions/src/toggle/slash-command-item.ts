import type { SlashCommandItem } from "../core/types";

export type ToggleSlashCommandItem = SlashCommandItem;

/** Slash command item for the `@editorcn/block-editor` menu. */
export const toggleSlashCommandItem: ToggleSlashCommandItem = {
  command: ({ editor, range }) => {
    if (!editor.can().setDetails()) {
      return;
    }
    editor.chain().focus().deleteRange(range).setDetails().run();
  },
  description: "Hide content inside a collapsible section.",
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
