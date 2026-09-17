"use client";

import {
  RichTextEditor,
  Link,
  useRichTextEditorContext,
  TwitterEmbed,
  YouTubeEmbed,
  CodeBlock,
} from "@editorcn/editor";
import type { RichTextEditorVariant } from "@editorcn/editor";
import {
  ResizableImage,
  ImagePlaceholder,
} from "@editorcn/extensions/image-placeholder";
import { ImagePlaceholderToolbar } from "@editorcn/extensions/image-placeholder-toolbar";
import { Table } from "@editorcn/extensions/table";
import { TableHoverOverlay } from "@editorcn/extensions/table-hover-overlay";
import { TableToolbar } from "@editorcn/extensions/table-toolbar";
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
import { StarterKit } from "@tiptap/starter-kit";

import "@editorcn/editor/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/table/style.css";
import "@editorcn/extensions/ui/style.css";

const InsertStarControl = () => {
  const { editor } = useRichTextEditorContext();

  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().insertContent("⭐").run()}
      aria-label="Insert star emoji"
      title="Insert star"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </RichTextEditor.Control>
  );
};

const DEMO_CONTENT = `
<h1 style="text-align: center;">Welcome to editorcn</h1>
<p>A rich text editor built on <a href="https://tiptap.dev/">Tiptap</a> and <strong>shadcn/ui</strong>. Every control in the toolbar is a standalone component — pick the ones you need, build your own layout.</p>
<hr>
<h2>Text Formatting</h2>
<p>Use the toolbar to apply <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <mark>highlighted text</mark>, H<sub>2</sub>O (subscript), and E=mc<sup>2</sup> (superscript). Inline <code>code</code> is also supported.</p>
<h2>Headings</h2>
<h3>Heading 3 — Section Title</h3>
<p>Headings from H1 through H6 are available. This editor uses six levels for deep document structure.</p>
<h4>Heading 4 — Subsection</h4>
<p>Nested content under a section. H4 works well for grouped items within an H3 section.</p>
<h5>Heading 5 — Detail</h5>
<p>Fine-grained headings for technical documentation or nested outlines.</p>
<h2>Lists</h2>
<p>Organize content with <strong>bullet lists</strong> and <strong>ordered lists</strong>:</p>
<ul>
  <li>Bullet list item one</li>
  <li>Bullet list with <strong>bold</strong> and <em>italic</em> text</li>
  <li>Nested bullet
    <ul>
      <li>Indented sub-item</li>
      <li>Another sub-item</li>
    </ul>
  </li>
</ul>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item with a <a href="#">link</a></li>
  <li>Third ordered item</li>
</ol>
<h2>Blockquote &amp; Code</h2>
<blockquote><p>A well-placed blockquote adds authority. The left border uses your theme's border color.</p></blockquote>
<p>For longer code snippets, use a <strong>code block</strong>:</p>
<pre><code class="language-javascript">function greet(name) {
  return \`Hello, \${name}! Welcome to editorcn.\`;
}</code></pre>
<h2>Alignment</h2>
<p style="text-align: left;">Left aligned — the default for most content.</p>
<p style="text-align: center;">Center aligned — great for headings or callouts.</p>
<p style="text-align: right;">Right aligned — useful for captions or annotations.</p>
<p style="text-align: justify;">Justified text stretches each line to fill the container width, creating clean edges on both sides. This works best for longer paragraphs where readability matters.</p>
<h2>Embeds</h2>
<p>Use the <strong>YouTube</strong> and <strong>Twitter</strong> buttons in the toolbar to paste a URL and embed content. Select an embed to see the resize handles — drag to resize. Embeds maintain their dimensions in the document and can be aligned left, center, or right.</p>
<h2>Table</h2>
<p>Tables use fixed-width columns that you can resize by dragging the handles on column edges. Hover over the table to see the controls.</p>
<table>
  <thead>
    <tr>
      <th>Extension</th>
      <th>Type</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Table</td>
      <td>Block</td>
      <td>Resizing</td>
    </tr>
    <tr>
      <td>Image</td>
      <td>Block</td>
      <td>Placeholder</td>
    </tr>
    <tr>
      <td>Highlight</td>
      <td>Mark</td>
      <td>Active</td>
    </tr>
  </tbody>
</table>
<hr>
<p style="text-align: center; color: var(--muted-foreground);">Built with Tiptap, shadcn/ui, and TypeScript. MIT licensed.</p>
`.trim();

export const EditorPreview = ({
  variant = "default",
}: {
  variant?: RichTextEditorVariant;
}) => {
  const editor = useEditor({
    content: DEMO_CONTENT,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
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
      Placeholder.configure({ placeholder: "Start typing..." }),
      CharacterCount,
      CodeBlock,
      Table.configure({ resizable: true }),
      ResizableImage,
      ImagePlaceholder,
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className="overflow-hidden rounded-md border border-border font-inter [&_.ProseMirror]:text-[15px]">
      <RichTextEditor editor={editor} variant={variant}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
            <RichTextEditor.H5 />
            <RichTextEditor.H6 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
            <RichTextEditor.AlignJustify />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Highlight />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.CodeBlock />
            <InsertStarControl />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.YouTubeEmbed />
            <RichTextEditor.TwitterEmbed />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <ImagePlaceholderToolbar editor={editor} />
            <TableToolbar editor={editor} />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.BubbleMenu editor={editor} />
        <RichTextEditor.Content className="px-2" />
        <RichTextEditor.Footer showWordCount />
      </RichTextEditor>
      <TableHoverOverlay editor={editor} />
    </div>
  );
};
