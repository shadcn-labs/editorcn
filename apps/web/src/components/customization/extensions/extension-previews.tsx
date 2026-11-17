"use client";

import {
  BlockEditor,
  SlashCommand,
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import { RichTextEditor } from "@editorcn/editor";
import { Callout } from "@editorcn/extensions/callout";
import { CalloutToolbar } from "@editorcn/extensions/callout-toolbar";
import { CodeBlock } from "@editorcn/extensions/code-block";
import { ToolbarProvider } from "@editorcn/extensions/core";
import {
  ImagePlaceholder,
  ResizableImage,
} from "@editorcn/extensions/image-placeholder";
import { ImagePlaceholderToolbar } from "@editorcn/extensions/image-placeholder-toolbar";
import { Markdown } from "@editorcn/extensions/markdown";
import { MarkdownToolbar } from "@editorcn/extensions/markdown-toolbar";
import { Mention } from "@editorcn/extensions/mention";
import { PasteCleanup } from "@editorcn/extensions/paste-cleanup";
import { Table } from "@editorcn/extensions/table";
import { TableHoverOverlay } from "@editorcn/extensions/table-hover-overlay";
import { TableToolbar } from "@editorcn/extensions/table-toolbar";
import { Toggle, toggleSlashCommandItem } from "@editorcn/extensions/toggle";
import type { AnyExtension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type { ReactNode } from "react";

import { searchPeople } from "@/lib/mention-people";

import "@editorcn/block-editor/style.css";
import "@editorcn/editor/style.css";
import "@editorcn/extensions/ui/style.css";
import "@editorcn/extensions/table/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/mention/style.css";
import "@editorcn/extensions/code-block/style.css";
import "@editorcn/extensions/callout/style.css";
import "@editorcn/extensions/toggle/style.css";

/* Table alignment + resize handle styling ships with
   @editorcn/extensions/table/style.css (see .ProseMirror.resize-cursor). */

interface PreviewConfig {
  content: string;
  extensions: AnyExtension[];
  toolbar: ReactNode;
  slashItems?: SlashCommandSuggestionItem[];
}
const PREVIEW_CONFIGS: Record<string, PreviewConfig> = {
  callout: {
    content:
      '<div data-type="callout" data-variant="info"><p>Click the icon to switch the callout type or remove it. Callouts hold any block content, like lists:</p><ul><li><p>Press Enter on an empty last line to leave the callout.</p></li></ul></div><div data-type="callout" data-variant="tip"><p>Type <code>&gt; [!WARNING]</code> followed by a space in an empty line to create a warning callout.</p></div><div data-type="callout" data-variant="warning" data-emoji="🔥"><p>Callouts can show a custom emoji instead of the icon.</p></div><p></p>',
    extensions: [StarterKit, Callout],
    slashItems: [
      {
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setCallout({ variant: "info" })
            .run(),
        description: "Highlight a note, tip, or warning",
        id: "callout",
        keywords: ["callout", "note", "tip", "warning", "alert", "info"],
        title: "Callout",
      },
    ],
    toolbar: <CalloutToolbar />,
  },
  "code-block": {
    content:
      '<p>Hover the code block to change its language, copy the code, add a caption, or open the actions menu. Set the language to Mermaid to see a live diagram.</p><pre><code class="language-typescript">type User = { id: string; name: string };\n\nexport const greet = (user: User) =&gt; {\n  return "Hello, " + user.name;\n};</code></pre><pre><code class="language-mermaid">graph LR\n  A[Write code] --&gt; B{Looks good?}\n  B --&gt;|Yes| C[Ship it]\n  B --&gt;|No| A</code></pre>',
    extensions: [StarterKit.configure({ codeBlock: false }), CodeBlock],
    toolbar: null,
  },
  "image-placeholder": {
    content:
      "<p>Click the image button in the toolbar to insert a placeholder, then upload a file or paste an image URL to replace it. The inserted image can be resized from its handles.</p>",
    extensions: [StarterKit, ResizableImage, ImagePlaceholder],
    slashItems: [
      {
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertImagePlaceholder()
            .run(),
        description: "Insert an image placeholder",
        id: "insertImagePlaceholder",
        keywords: ["image", "photo", "picture"],
        title: "Image",
      },
    ],
    toolbar: <ImagePlaceholderToolbar />,
  },
  markdown: {
    content:
      "<p>Copy some markdown, like <code># Heading</code>, <code>- list item</code> or <code>**bold**</code>, and paste it here. It turns into formatted content. Pasting rich text from a web page keeps working as before.</p>",
    extensions: [StarterKit, Markdown.configure({ pasteMarkdown: true })],
    toolbar: <MarkdownToolbar />,
  },
  mention: {
    content:
      '<p>Type <code>@</code> to mention someone, like <span data-type="mention" data-id="3" data-label="Grace Hopper"></span>. Use the arrow keys to move, Enter or Tab to pick, and Esc to close. Backspace removes the whole mention.</p>',
    extensions: [
      StarterKit,
      Mention.configure({ heading: "People", items: searchPeople }),
    ],
    toolbar: null,
  },
  "paste-cleanup": {
    content:
      "<p>Copy a few paragraphs from Google Docs, Notion, Word, or a web page and paste them here. Bold, italic, links, and lists come through, while fonts, colors, and empty lines are dropped. Press Ctrl+Shift+V (Cmd+Shift+V on Mac) to paste plain text.</p>",
    extensions: [StarterKit, PasteCleanup],
    toolbar: null,
  },
  table: {
    content:
      "<h2>Table</h2><p>Click inside the table, then use the Table control to add or remove rows and columns, merge or split cells, and toggle the header row. In the block editor, type <code>/</code> to insert a table from the command menu.</p><table><thead><tr><th>Feature</th><th>Status</th></tr></thead><tbody><tr><td>Rows</td><td>Add / delete</td></tr><tr><td>Columns</td><td>Add / delete</td></tr><tr><td>Cells</td><td>Merge / split</td></tr></tbody></table>",
    extensions: [StarterKit, Table],
    slashItems: [
      {
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTableWithHeader()
            .run(),
        description: "Insert a table with a header row",
        id: "insertTableWithHeader",
        keywords: ["table", "row", "column"],
        title: "Insert table",
      },
    ],
    toolbar: <TableToolbar />,
  },
  toggle: {
    content:
      '<p>Click the triangle to collapse or expand a section. Press <code>Enter</code> in the title to jump into the content, and <code>Backspace</code> on an empty title to remove the toggle. Toggles hold any block content, including other toggles:</p><details open><summary>What can go inside?</summary><div data-type="detailsContent"><p>Paragraphs, lists, code blocks, tables — and more toggles:</p><details><summary>A nested toggle</summary><div data-type="detailsContent"><p>Collapsed by default. Click the triangle to open it.</p></div></details></div></details><p></p>',
    extensions: [StarterKit, Toggle],
    slashItems: [toggleSlashCommandItem],
    toolbar: null,
  },
};

const ToolbarEditorPreview = ({ config }: { config: PreviewConfig }) => {
  const editor = useEditor({
    content: config.content,
    extensions: config.extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <ToolbarProvider editor={editor}>{config.toolbar}</ToolbarProvider>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content>
          <TableHoverOverlay editor={editor} />
        </RichTextEditor.Content>
      </RichTextEditor>
    </div>
  );
};

const BlockEditorPreview = ({ config }: { config: PreviewConfig }) => {
  const editor = useEditor({
    content: config.content,
    extensions: [
      ...config.extensions,
      Placeholder.configure({ placeholder: "Type / for commands..." }),
      SlashCommand.configure({
        suggestion: getSlashCommandSuggestion([
          ...defaultSlashCommandItems,
          ...(config.slashItems ?? []),
        ]),
      }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className="relative rounded-md border border-border">
      <BlockEditor className="px-4 py-2" editor={editor} />
      <TableHoverOverlay editor={editor} />
    </div>
  );
};

export const ExtensionPreview = ({
  slug,
  editor = "toolbar",
}: {
  slug: string;
  editor?: "toolbar" | "block";
}) => {
  const config = PREVIEW_CONFIGS[slug];

  if (editor === "block") {
    return <BlockEditorPreview config={config} />;
  }

  return <ToolbarEditorPreview config={config} />;
};
