"use client";

import { BlockEditor } from "@editorcn/block-editor";
import { HeadingSelect } from "@editorcn/custom-controls/controls/heading-select";
import { HighlightColorControl } from "@editorcn/custom-controls/controls/highlight-color";
import { ImageControl } from "@editorcn/custom-controls/controls/image";
import { InsertLinkControl } from "@editorcn/custom-controls/controls/insert-link";
import { TableControl } from "@editorcn/custom-controls/controls/table";
import { EditorControlsProvider } from "@editorcn/custom-controls/core";
import { RichTextEditor } from "@editorcn/editor";
import type { AnyExtension } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { Image as ImageExtension } from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
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
`;

interface PreviewConfig {
  content: string;
  element: ReactNode;
  extensions: AnyExtension[];
  style?: string;
}

const PREVIEW_CONFIGS: Record<string, PreviewConfig> = {
  "heading-select": {
    content:
      "<h2>Try the heading select</h2><p>Place the cursor in this paragraph or the heading above, then open the select in the toolbar to switch between paragraph and heading levels.</p>",
    element: <HeadingSelect />,
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
  },
  "highlight-color": {
    content:
      "<p>Select some text and use the highlight control in the toolbar to apply a highlight color, or remove it again.</p>",
    element: <HighlightColorControl />,
    extensions: [StarterKit, Highlight.configure({ multicolor: true })],
  },
  image: {
    content:
      "<p>Use the image control in the toolbar and paste an image URL to insert an image at the cursor.</p>",
    element: <ImageControl />,
    extensions: [StarterKit, ImageExtension],
  },
  "insert-link": {
    content:
      "<p>Select a phrase below and use the link control in the toolbar to turn it into a hyperlink.</p><p>The selection is prefilled into the URL dialog.</p>",
    element: <InsertLinkControl />,
    extensions: [StarterKit, TipTapLink.configure({ openOnClick: true })],
  },
  table: {
    content:
      "<h2>Table control</h2><p>Click inside the table, then use the Table control in the toolbar to add or remove rows and columns, merge or split cells, and toggle the header row.</p><table><thead><tr><th>Feature</th><th>Status</th></tr></thead><tbody><tr><td>Rows</td><td>Add / delete</td></tr><tr><td>Columns</td><td>Add / delete</td></tr><tr><td>Cells</td><td>Merge / split</td></tr></tbody></table>",
    element: <TableControl />,
    extensions: [StarterKit, Table, TableRow, TableCell, TableHeader],
    style: TABLE_CSS,
  },
};

const ControlPreviewShell = ({
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
    <ControlPreviewShell style={config.style}>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <EditorControlsProvider editor={editor}>
              {config.element}
            </EditorControlsProvider>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor>
    </ControlPreviewShell>
  );
};

const BlockEditorPreview = ({ config }: { config: PreviewConfig }) => {
  const editor = useEditor({
    content: config.content,
    extensions: config.extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <ControlPreviewShell style={config.style}>
      <BlockEditor editor={editor}>
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 p-2">
          <EditorControlsProvider editor={editor}>
            {config.element}
          </EditorControlsProvider>
        </div>
        <BlockEditor.Content />
      </BlockEditor>
    </ControlPreviewShell>
  );
};

export const ControlPreview = ({
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
