interface ControlUsageMeta {
  component: string;
  dependencies: string[];
  extensions: string[];
  starterKit?: string;
}

const USAGE_META: Record<string, ControlUsageMeta> = {
  "heading-select": {
    component: "HeadingSelect",
    dependencies: [],
    extensions: [],
    starterKit: "StarterKit.configure({ heading: { levels: [1, 2, 3] } }),",
  },
  "highlight-color": {
    component: "HighlightColorControl",
    dependencies: ['import Highlight from "@tiptap/extension-highlight";'],
    extensions: ["Highlight.configure({ multicolor: true }),"],
  },
  image: {
    component: "ImageControl",
    dependencies: ['import Image from "@tiptap/extension-image";'],
    extensions: ["Image,"],
  },
  "insert-link": {
    component: "InsertLinkControl",
    dependencies: ['import Link from "@tiptap/extension-link";'],
    extensions: ["Link.configure({ openOnClick: true }),"],
  },
  table: {
    component: "TableControl",
    dependencies: [
      'import { Table } from "@tiptap/extension-table";',
      'import TableRow from "@tiptap/extension-table-row";',
      'import TableCell from "@tiptap/extension-table-cell";',
      'import TableHeader from "@tiptap/extension-table-header";',
    ],
    extensions: ["Table,", "TableRow,", "TableCell,", "TableHeader,"],
  },
};

const extensionsBlock = (slug: string, meta: ControlUsageMeta) => {
  const lines = [meta.starterKit ?? "StarterKit,", ...meta.extensions];

  return lines.map((line) => `      ${line}`).join("\n");
};

const dependencyBlock = (meta: ControlUsageMeta) =>
  meta.dependencies.length > 0 ? `${meta.dependencies.join("\n")  }\n\n` : "";

const buildToolbarUsage = (
  slug: string,
  meta: ControlUsageMeta
) => `"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
${dependencyBlock(meta)}import { RichTextEditor } from "@/components/editor";
import { EditorControlsProvider } from "@/components/custom-controls/core/context";
import { ${meta.component} } from "@/components/custom-controls/controls/${slug}";

import "@/components/editor/style.css";

export function MyEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
${extensionsBlock(slug, meta)}
    ],
  });

  return (
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
            <${meta.component} />
          </EditorControlsProvider>
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
`;

const buildBlockUsage = (slug: string, meta: ControlUsageMeta) => `"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
${dependencyBlock(meta)}import { BlockEditor } from "@/components/block-editor";
import { EditorControlsProvider } from "@/components/custom-controls/core/context";
import { ${meta.component} } from "@/components/custom-controls/controls/${slug}";

import "@/components/block-editor/style.css";

export function MyBlockEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
${extensionsBlock(slug, meta)}
    ],
  });

  return (
    <BlockEditor editor={editor}>
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 p-2">
        <EditorControlsProvider editor={editor}>
          <${meta.component} />
        </EditorControlsProvider>
      </div>
      <BlockEditor.Content />
    </BlockEditor>
  );
}
`;

export const CUSTOM_CONTROL_USAGE = Object.fromEntries(
  Object.entries(USAGE_META).map(([slug, meta]) => [
    slug,
    {
      block: buildBlockUsage(slug, meta),
      toolbar: buildToolbarUsage(slug, meta),
    },
  ])
) as Record<string, { block: string; toolbar: string }>;
