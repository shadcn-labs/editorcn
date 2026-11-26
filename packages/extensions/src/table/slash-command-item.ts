import type { SlashCommandItem } from "../core/types";

/** Slash command item for the `@editorcn/block-editor` menu. */
export const tableSlashCommandItem: SlashCommandItem = {
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).insertTableWithHeader().run();
  },
  description: "Insert a table.",
  id: "table",
  keywords: ["table", "grid"],
  title: "Table",
};
