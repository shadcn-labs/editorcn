import type { SlashCommandItem } from "../core/types";
import { downloadMarkdown, importMarkdownFile } from "./files";

/** Import and export slash command items for the `@editorcn/block-editor` menu. */
export const getMarkdownSlashCommandItems = (
  filename = "document.md"
): SlashCommandItem[] => [
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      importMarkdownFile(editor);
    },
    description: "Replace the document with a .md file.",
    id: "importMarkdown",
    keywords: ["markdown", "md", "import", "upload"],
    title: "Import Markdown",
  },
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      downloadMarkdown(editor, filename);
    },
    description: "Download the document as a .md file.",
    id: "exportMarkdown",
    keywords: ["markdown", "md", "export", "download"],
    title: "Export Markdown",
  },
];
