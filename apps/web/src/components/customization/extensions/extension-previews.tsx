"use client";

import {
  BlockEditor,
  SlashCommand,
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import { RichTextEditor } from "@editorcn/editor";
import { ToolbarProvider } from "@editorcn/extensions/core";
import { Highlight } from "@editorcn/extensions/highlight";
import { HighlightToolbar } from "@editorcn/extensions/highlight-toolbar";
import { ImagePlaceholder, ResizableImage } from "@editorcn/extensions/image-placeholder";
import { ImagePlaceholderToolbar } from "@editorcn/extensions/image-placeholder-toolbar";
import { Table } from "@editorcn/extensions/table";
import { TableToolbar } from "@editorcn/extensions/table-toolbar";
import type { AnyExtension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type { ReactNode } from "react";

import "@editorcn/block-editor/style.css";
import "@editorcn/editor/style.css";

const TABLE_CSS = `
.rte-content table, .block-editor-content table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0;
  overflow: hidden;
  position: relative;
}
.rte-content td, .rte-content th, .block-editor-content td, .block-editor-content th {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  text-align: left;
  min-width: 80px;
  position: relative;
}
.rte-content th, .block-editor-content th {
  background: var(--muted);
  font-weight: 600;
}
.rte-content .selectedCell, .block-editor-content .selectedCell {
  background: var(--accent);
}
.rte-content table .column-resize-handle, .block-editor-content table .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background-color: var(--primary);
  pointer-events: none;
}
.rte-content table.resize-cursor, .block-editor-content table.resize-cursor {
  cursor: col-resize;
}
`;

interface PreviewConfig {
  content: string;
  extensions: AnyExtension[];
  toolbar: ReactNode;
  slashItems?: SlashCommandSuggestionItem[];
  style?: string;
}

const PREVIEW_CONFIGS: Record<string, PreviewConfig> = {
  highlight: {
    content:
      "<p>Select some text and use the highlight control in the toolbar to apply a highlight color, or remove it again.</p>",
    extensions: [StarterKit, Highlight],
    toolbar: <HighlightToolbar />,
  },
  "image-placeholder": {
    content:
      "<p>Click the image button in the toolbar to insert a placeholder, then upload a file or paste an image URL to replace it. The inserted image can be resized from its handles.</p>",
    extensions: [StarterKit, ResizableImage, ImagePlaceholder],
    toolbar: <ImagePlaceholderToolbar />,
    slashItems: [
      {
        id: "insertImagePlaceholder",
        title: "Image",
        description: "Insert an image placeholder",
        keywords: ["image", "photo", "picture"],
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertImagePlaceholder()
            .run(),
      },
    ],
  },
  table: {
    content:
      "<h2>Table</h2><p>Click inside the table, then use the Table control to add or remove rows and columns, merge or split cells, and toggle the header row. In the block editor, type <code>/</code> to insert a table from the command menu.</p><table><thead><tr><th>Feature</th><th>Status</th></tr></thead><tbody><tr><td>Rows</td><td>Add / delete</td></tr><tr><td>Columns</td><td>Add / delete</td></tr><tr><td>Cells</td><td>Merge / split</td></tr></tbody></table>",
    extensions: [StarterKit, Table],
    toolbar: <TableToolbar />,
    style: TABLE_CSS,
    slashItems: [
      {
        id: "insertTableWithHeader",
        title: "Insert table",
        description: "Insert a table with a header row",
        keywords: ["table", "row", "column"],
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTableWithHeader()
            .run(),
      },
    ],
  },
};

const ExtensionPreviewShell = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: string;
}) => (
  <div className="overflow-hidden rounded-md border border-border">
    {style ? <style>{style}</style> : null}
    {children}
  </div>
);

const ToolbarEditorPreview = ({ config }: { config: PreviewConfig }) => {
  const editor = useEditor({
    content: config.content,
    extensions: config.extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <ExtensionPreviewShell style={config.style}>
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
        <RichTextEditor.Content />
      </RichTextEditor>
    </ExtensionPreviewShell>
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
    <ExtensionPreviewShell style={config.style}>
      <BlockEditor editor={editor} />
    </ExtensionPreviewShell>
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