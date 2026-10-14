"use client";

import {
  BlockEditor,
  SlashCommand,
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import { RichTextEditor } from "@editorcn/editor";
import type { AiGenerateInput } from "@editorcn/extensions/ai";
import { AiPromptBar } from "@editorcn/extensions/ai-toolbar";
import { ToolbarProvider } from "@editorcn/extensions/core";
import {
  ImagePlaceholder,
  ResizableImage,
} from "@editorcn/extensions/image-placeholder";
import { ImagePlaceholderToolbar } from "@editorcn/extensions/image-placeholder-toolbar";
import { Table } from "@editorcn/extensions/table";
import { TableHoverOverlay } from "@editorcn/extensions/table-hover-overlay";
import { TableToolbar } from "@editorcn/extensions/table-toolbar";
import type { AnyExtension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type { ReactNode } from "react";

import "@editorcn/block-editor/style.css";
import "@editorcn/editor/style.css";
import "@editorcn/extensions/ui/style.css";
import "@editorcn/extensions/ai/style.css";
import "@editorcn/extensions/table/style.css";
import "@editorcn/extensions/image-placeholder/style.css";

/* Table alignment + resize handle styling ships with
   @editorcn/extensions/table/style.css (see .ProseMirror.resize-cursor). */

interface PreviewConfig {
  content: string;
  extensions: AnyExtension[];
  toolbar: ReactNode;
  slashItems?: SlashCommandSuggestionItem[];
}

const PREVIEW_CONFIGS: Record<string, PreviewConfig> = {
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
    <div className="overflow-hidden rounded-md border border-border">
      <BlockEditor editor={editor} />
      <TableHoverOverlay editor={editor} />
    </div>
  );
};

const TYPOS: Record<string, string> = {
  realy: "really",
  recieve: "receive",
  seperate: "separate",
  teh: "the",
  trafic: "traffic",
};

const sentences = (text: string) =>
  text.split(/(?<=[.?!])\s+/).filter((sentence) => sentence.trim() !== "");

const list = (title: string, items: string[]) =>
  items.length === 0
    ? `<p><strong>${title}:</strong> none found.</p>`
    : `<p><strong>${title}</strong></p><ul>${items.map((item) => `<li><p>${item}</p></li>`).join("")}</ul>`;

const mockGenerate = async ({ prompt, context, task }: AiGenerateInput) => {
  const delay = Promise.withResolvers<null>();
  setTimeout(() => delay.resolve(null), 700);
  await delay.promise;
  switch (task) {
    case "fix-spelling": {
      return context.replaceAll(/\b\w+\b/g, (word) => {
        const fixed = TYPOS[word.toLowerCase()];
        if (!fixed) {
          return word;
        }
        return word[0] === word[0].toUpperCase()
          ? fixed[0].toUpperCase() + fixed.slice(1)
          : fixed;
      });
    }
    case "tighten": {
      return context
        .replaceAll(/\b(really|realy|basically|actually|just|very)\s+/gi, "")
        .replaceAll(/\bin order to\b/gi, "to");
    }
    case "summary": {
      const summary = context
        .split("\n")
        .map((line) => sentences(line)[0])
        .filter(Boolean)
        .slice(0, 2)
        .join(" ");
      return `<p><strong>Summary:</strong> ${summary}</p>`;
    }
    case "checklist": {
      return list(
        "Checklist",
        [...context.matchAll(/Todo:\s*([^.]+)/gi)].map((match) => match[1])
      );
    }
    case "open-questions": {
      return list(
        "Open questions",
        sentences(context.replaceAll("\n", " ")).filter(
          (sentence) => sentence.includes("?") || /\bTBD\b/.test(sentence)
        )
      );
    }
    case "owners": {
      return list("Owners", [...new Set(context.match(/@\w+/g))]);
    }
    default: {
      return `(Demo) You asked: "${prompt}". Connect a real model with onGenerate.`;
    }
  }
};

const AiPreview = () => {
  const editor = useEditor({
    content:
      "<p>We will realy only ship the new search when latency is basically under 200 ms. Teh rollout starts with 5% of trafic.</p><p>Rollout is owned by @maya and metrics are owned by @sam.</p><p>Should we keep the old index as a fallback? Pricing for the paid tier is TBD.</p><p>Todo: update the docs. Todo: notify support. Todo: add dashboards.</p>",
    extensions: [StarterKit],
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
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
        <AiPromptBar editor={editor} onGenerate={mockGenerate} />
      </RichTextEditor>
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
  if (slug === "ai") {
    return <AiPreview />;
  }
  const config = PREVIEW_CONFIGS[slug];

  if (editor === "block") {
    return <BlockEditorPreview config={config} />;
  }

  return <ToolbarEditorPreview config={config} />;
};
