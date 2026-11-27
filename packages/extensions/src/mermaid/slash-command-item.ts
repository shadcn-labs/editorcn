import type { SlashCommandItem } from "../core/types";

/** Slash command item for the `@editorcn/block-editor` menu. */
export const mermaidSlashCommandItem: SlashCommandItem = {
  command: ({ editor, range }) => {
    if (!editor.can().setMermaid()) {
      return;
    }
    editor.chain().focus().deleteRange(range).setMermaid().run();
  },
  description: "Draw a flowchart, sequence or other diagram with Mermaid.",
  id: "mermaid",
  keywords: ["mermaid", "diagram", "flowchart", "chart", "sequence", "graph"],
  title: "Diagram",
};
