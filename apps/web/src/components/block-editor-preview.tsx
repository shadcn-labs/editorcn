"use client";

import {
  BlockEditor,
  SlashCommand,
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import {
  ImagePlaceholder,
  ResizableImage,
} from "@editorcn/extensions/image-placeholder";
import { Table } from "@editorcn/extensions/table";
import { TableHoverOverlay } from "@editorcn/extensions/table-hover-overlay";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
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
import { StarterKit } from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import "@editorcn/block-editor/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/ui/style.css";
import "@editorcn/extensions/table/style.css";

const DEMO_CONTENT = `
<h1 style="text-align: center;">Block Editor</h1>
<p>A block-style editor built on <strong>Tiptap</strong> and <strong>shadcn/ui</strong>. Type <code>/</code> to open the command menu and insert blocks. Drag the handle on the left to reorder any block.</p>
<h2>Text Formatting</h2>
<p>Select any text to see the <strong>bubble menu</strong> with <em>formatting</em> options. You can also use <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<h2>Task List</h2>
<ul data-type="taskList">
   <li data-type="taskItem" data-checked="true">Design the component API</li>
   <li data-type="taskItem" data-checked="true">Build the slash command menu</li>
   <li data-type="taskItem" data-checked="false">Add table support</li>
   <li data-type="taskItem" data-checked="false">Write documentation</li>
</ul>
<h2>Table</h2>
<p>Use <code>/table</code> to insert a table. Resize columns by dragging the handles.</p>
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bubble menu</td>
      <td>Done</td>
      <td>High</td>
    </tr>
    <tr>
      <td>Drag handles</td>
      <td>Done</td>
      <td>High</td>
    </tr>
    <tr>
      <td>Tables</td>
      <td>In progress</td>
      <td>Medium</td>
    </tr>
  </tbody>
</table>
<h2>Code Block with Syntax Highlighting</h2>
<pre><code class="language-javascript">import { BlockEditor } from "@editorcn/block-editor";
import StarterKit from "@tiptap/starter-kit";

function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
  });

  return &lt;BlockEditor editor={editor} /&gt;;
}</code></pre>
<h2>Blockquote</h2>
<blockquote><p>Block-level content with drag handles for reordering. Every block can be moved, edited, or deleted independently.</p></blockquote>
<h2>Text Alignment</h2>
<p style="text-align: center;">Center-aligned text — great for headings.</p>
<p style="text-align: right;">Right-aligned text — useful for annotations.</p>
<h2>Images &amp; Links</h2>
<p>Type <code>/image</code> to insert an image by URL. Links are auto-detected and open in a new tab. Drag handles let you reorder any block — try it on this paragraph.</p>
`.trim();

const myItems: SlashCommandSuggestionItem[] = [
  ...defaultSlashCommandItems,
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent("Hello!").run();
    },
    description: "A custom command",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
    id: "custom",
    keywords: ["custom"],
    title: "Custom",
  },
  {
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertImagePlaceholder().run();
    },
    description: "Insert an image placeholder you can fill in.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
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
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    id: "table",
    keywords: ["table", "grid"],
    title: "Table",
  },
];

const lowlight = createLowlight(common);

export const BlockEditorPreview = () => {
  const editor = useEditor({
    content: DEMO_CONTENT,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: "Type / for commands..." }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      SlashCommand.configure({
        suggestion: getSlashCommandSuggestion(myItems),
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({ resizable: true }),
      ResizableImage,
      ImagePlaceholder,
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        openOnClick: true,
        protocols: ["http", "https"],
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className="relative rounded-md border border-border font-inter [&_.ProseMirror]:text-[15px]">
      <BlockEditor
        editor={editor}
        className="px-2"
        icons={{
          boldIcon: <strong>B</strong>,
          italicIcon: <em>I</em>,
          slashHeadingIcon: <span className="text-sm font-bold">H</span>,
          slashTextIcon: <span className="text-sm font-bold">T</span>,
        }}
      />
      <TableHoverOverlay editor={editor} />
    </div>
  );
};
