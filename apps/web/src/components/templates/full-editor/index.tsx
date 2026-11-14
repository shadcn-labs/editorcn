"use client";

import {
  Link,
  RichTextEditor,
  TwitterEmbed,
  YouTubeEmbed,
} from "@editorcn/editor";
import type { RichTextEditorVariant } from "@editorcn/editor";
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
import { CharacterCount } from "@tiptap/extension-character-count";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import type { Content, JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { cn } from "@/lib/utils";

import { FullEditorToolbar } from "./toolbar";

import "@editorcn/editor/style.css";
import "@editorcn/extensions/callout/style.css";
import "@editorcn/extensions/code-block/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/mention/style.css";
import "@editorcn/extensions/table/style.css";
import "@editorcn/extensions/ui/style.css";

export interface FullEditorProps {
  className?: string;
  content?: Content;
  markdownFilename?: string;
  onChange?: (content: JSONContent) => void;
  placeholder?: string;
  searchUsers?: (query: string) => MentionItem[] | Promise<MentionItem[]>;
  variant?: RichTextEditorVariant;
}

export const FullEditor = ({
  className,
  content,
  markdownFilename = "document.md",
  onChange,
  placeholder = "Start typing...",
  searchUsers = () => [],
  variant = "default",
}: FullEditorProps) => {
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,
        underline: false,
      }),
      Link,
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TwitterEmbed,
      YouTubeEmbed,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      CodeBlock,
      Callout,
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
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange?.(current.getJSON()),
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className={cn("relative", className)}>
      <RichTextEditor editor={editor} variant={variant}>
        <FullEditorToolbar
          editor={editor}
          markdownFilename={markdownFilename}
        />
        <RichTextEditor.BubbleMenu editor={editor} />
        <RichTextEditor.Content className="px-2" />
        <RichTextEditor.Footer showWordCount />
      </RichTextEditor>
      <TableHoverOverlay editor={editor} />
    </div>
  );
};
