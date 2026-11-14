"use client";

import { defaultSlashCommandItems } from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import {
  downloadMarkdown,
  importMarkdownFile,
} from "@editorcn/extensions/markdown";
import {
  FileDown,
  FileUp,
  ImageIcon,
  MessageSquareWarning,
  TableIcon,
} from "lucide-react";

export const createSlashItems = (
  markdownFilename: string
): SlashCommandSuggestionItem[] => [
  ...defaultSlashCommandItems,
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertImagePlaceholder().run();
    },
    description: "Insert an image placeholder you can fill in.",
    icon: <ImageIcon />,
    id: "image",
    keywords: ["image", "img", "picture", "photo"],
    title: "Image",
  },
  {
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ cols: 3, rows: 3, withHeaderRow: true })
        .run();
    },
    description: "Insert a table.",
    icon: <TableIcon />,
    id: "table",
    keywords: ["table", "grid"],
    title: "Table",
  },
  {
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCallout({ variant: "info" })
        .run();
    },
    description: "Highlight a note, tip, or warning.",
    icon: <MessageSquareWarning />,
    id: "callout",
    keywords: ["callout", "note", "tip", "warning", "alert", "info"],
    title: "Callout",
  },
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      importMarkdownFile(editor);
    },
    description: "Replace the document with a .md file.",
    icon: <FileUp />,
    id: "importMarkdown",
    keywords: ["markdown", "md", "import", "upload"],
    title: "Import Markdown",
  },
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      downloadMarkdown(editor, markdownFilename);
    },
    description: "Download the document as a .md file.",
    icon: <FileDown />,
    id: "exportMarkdown",
    keywords: ["markdown", "md", "export", "download"],
    title: "Export Markdown",
  },
];
