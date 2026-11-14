"use client";

import {
  BlockEditor,
  SlashCommand,
  getSlashCommandSuggestion,
} from "@editorcn/block-editor";
import { Callout } from "@editorcn/extensions/callout";
import { CodeBlock } from "@editorcn/extensions/code-block";
import {
  ImagePlaceholder,
  ResizableImage,
} from "@editorcn/extensions/image-placeholder";
import { Markdown } from "@editorcn/extensions/markdown";
import { Mention } from "@editorcn/extensions/mention";
import type { MentionItem } from "@editorcn/extensions/mention";
import { PasteCleanup } from "@editorcn/extensions/paste-cleanup";
import { Table } from "@editorcn/extensions/table";
import { TableHoverOverlay } from "@editorcn/extensions/table-hover-overlay";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import type { Content, JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { cn } from "@/lib/utils";

import { createSlashItems } from "./slash-items";

import "@editorcn/block-editor/style.css";
import "@editorcn/extensions/callout/style.css";
import "@editorcn/extensions/code-block/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/mention/style.css";
import "@editorcn/extensions/table/style.css";
import "@editorcn/extensions/ui/style.css";

export interface FullBlockEditorProps {
  className?: string;
  content?: Content;
  markdownFilename?: string;
  onChange?: (content: JSONContent) => void;
  placeholder?: string;
  searchUsers?: (query: string) => MentionItem[] | Promise<MentionItem[]>;
}

export const FullBlockEditor = ({
  className,
  content,
  markdownFilename = "document.md",
  onChange,
  placeholder = "Type / for commands...",
  searchUsers = () => [],
}: FullBlockEditorProps) => {
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlock,
      Callout,
      SlashCommand.configure({
        suggestion: getSlashCommandSuggestion(
          createSlashItems(markdownFilename)
        ),
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      ResizableImage,
      ImagePlaceholder,
      Markdown.configure({ pasteMarkdown: true }),
      PasteCleanup,
      Mention.configure({
        debounce: 0,
        heading: "People",
        items: searchUsers,
      }),
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        openOnClick: true,
        protocols: ["http", "https"],
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange?.(current.getJSON()),
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className={cn("relative", className)}>
      <BlockEditor editor={editor} className="px-2" />
      <TableHoverOverlay editor={editor} />
    </div>
  );
};
