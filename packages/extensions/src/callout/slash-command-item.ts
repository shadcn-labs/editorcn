import type { SlashCommandItem } from "../core/types";

/** Slash command item for the `@editorcn/block-editor` menu. */
export const calloutSlashCommandItem: SlashCommandItem = {
  command: ({ editor, range }) => {
    if (!editor.can().setCallout({ variant: "info" })) {
      return;
    }
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .setCallout({ variant: "info" })
      .run();
  },
  description: "Highlight a note, tip, or warning.",
  id: "callout",
  keywords: ["callout", "note", "tip", "warning", "alert", "info"],
  title: "Callout",
};
