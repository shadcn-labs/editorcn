"use client";

import { FullBlockEditor } from "@/components/templates/full-block-editor";
import { searchPeople } from "@/lib/mention-people";

const DEMO_CONTENT = `
<h1 style="text-align: center;">Block Editor</h1>
<p>A block-style editor built on <strong>Tiptap</strong> and <strong>shadcn/ui</strong>. Type <code>/</code> to open the command menu and insert blocks, or <code>@</code> to mention someone like <span data-type="mention" data-id="1" data-label="Ada Lovelace"></span>. Drag the handle on the left to reorder any block.</p>
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
import { StarterKit } from "@tiptap/starter-kit";

function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
  });

  return &lt;BlockEditor editor={editor} /&gt;;
}</code></pre>
<h2>Mermaid Diagram</h2>
<p>Set a code block language to <strong>Mermaid</strong> to see a live diagram below the code.</p>
<pre><code class="language-mermaid">graph LR
  A[Type in the editor] --&gt; B{Code or diagram?}
  B --&gt;|Code| C[Shiki highlighting]
  B --&gt;|Mermaid| D[Live preview]</code></pre>
<h2>Callout</h2>
<div data-type="callout" data-variant="info"><p>Type <code>/callout</code> to insert a callout, or <code>&gt; [!WARNING]</code> and a space. Click the icon to switch between info, tip, warning, danger, and note.</p></div>
<h2>Blockquote</h2>
<blockquote><p>Block-level content with drag handles for reordering. Every block can be moved, edited, or deleted independently.</p></blockquote>
<h2>Text Alignment</h2>
<p style="text-align: center;">Center-aligned text — great for headings.</p>
<p style="text-align: right;">Right-aligned text — useful for annotations.</p>
<h2>Images &amp; Links</h2>
<p>Type <code>/image</code> to insert an image by URL. Links are auto-detected and open in a new tab. Drag handles let you reorder any block — try it on this paragraph.</p>
`.trim();

export const BlockEditorPreview = () => (
  <FullBlockEditor
    className="rounded-2xl border border-border/60 bg-card font-inter text-card-foreground [&_.ProseMirror]:text-[15px]"
    content={DEMO_CONTENT}
    markdownFilename="editorcn.md"
    searchUsers={searchPeople}
  />
);
