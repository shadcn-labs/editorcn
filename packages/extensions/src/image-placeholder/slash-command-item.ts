import type { SlashCommandItem } from "../core/types";

/** Slash command item for the `@editorcn/block-editor` menu. */
export const imagePlaceholderSlashCommandItem: SlashCommandItem = {
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).insertImagePlaceholder().run();
  },
  description: "Upload or embed an image.",
  id: "image",
  keywords: ["image", "img", "picture", "photo"],
  title: "Image",
};
