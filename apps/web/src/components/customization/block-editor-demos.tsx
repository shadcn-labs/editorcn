"use client";

import {
  BlockEditor,
  SlashCommand,
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import { CodeBlock } from "@editorcn/extensions/code-block";
import {
  ImagePlaceholder,
  ResizableImage,
  imagePlaceholderSlashCommandItem,
} from "@editorcn/extensions/image-placeholder";
import { Table, tableSlashCommandItem } from "@editorcn/extensions/table";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import "@editorcn/block-editor/style.css";
import "@editorcn/extensions/code-block/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/table/style.css";

const BLOCK_CONTENT = `
<h2>Getting Started</h2>
<p>Type <code>/</code> to open the command menu. Hover the left edge to see the drag handle.</p>
<blockquote><p>Block-level content with drag handles.</p></blockquote>
<ul data-type="taskList">
   <li data-type="taskItem" data-checked="true">Done task</li>
   <li data-type="taskItem" data-checked="false">Pending task</li>
</ul>
<pre><code class="language-javascript">console.log("Hello, world!");</code></pre>
`.trim();

const createExtensions = (slashItems: SlashCommandSuggestionItem[]) => [
  StarterKit.configure({
    codeBlock: false,
    heading: { levels: [1, 2, 3] },
  }),
  Placeholder.configure({ placeholder: "Type / for commands..." }),
  TaskList,
  TaskItem.configure({ nested: true }),
  CodeBlock,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Table,
  ResizableImage,
  ImagePlaceholder,
  SlashCommand.configure({ suggestion: getSlashCommandSuggestion(slashItems) }),
];

const extensions = createExtensions([
  ...defaultSlashCommandItems,
  imagePlaceholderSlashCommandItem,
  tableSlashCommandItem,
]);

export const BlockEditorVariantsDemo = () => {
  const editor = useEditor({
    content: BLOCK_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <BlockEditor className="px-4 py-2" editor={editor} />
    </div>
  );
};

export const BlockEditorThemingDemo = () => {
  const editor = useEditor({
    content: BLOCK_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <div
      style={
        {
          "--accent": "oklch(0.9 0.06 280)",
          "--accent-foreground": "oklch(0.3 0.1 280)",
          "--muted": "oklch(0.93 0.03 280)",
          "--muted-foreground": "oklch(0.5 0.05 280)",
          "--primary": "oklch(0.55 0.25 280)",
          "--radius": "0.5rem",
        } as React.CSSProperties
      }
    >
      <BlockEditor className="px-4 py-2" editor={editor} />
    </div>
  );
};

export const BlockEditorClassNameDemo = () => {
  const editor = useEditor({
    content: BLOCK_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <BlockEditor
      editor={editor}
      className="border-2 border-dashed border-primary/50 rounded-xl px-4 py-2"
    />
  );
};

const customSlashItems: SlashCommandSuggestionItem[] = [
  {
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent("Hello there! 👋")
        .run();
    },
    description: "Insert a friendly greeting.",
    id: "greeting",
    keywords: ["hello", "hi", "greeting"],
    title: "Greeting",
  },
  imagePlaceholderSlashCommandItem,
  tableSlashCommandItem,
];

const customSlashExtensions = createExtensions(customSlashItems);

export const BlockEditorCustomSlashCommandsDemo = () => {
  const editor = useEditor({
    content: BLOCK_CONTENT,
    extensions: customSlashExtensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <BlockEditor className="px-4 py-2" editor={editor} />
    </div>
  );
};
