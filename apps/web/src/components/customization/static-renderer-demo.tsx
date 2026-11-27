"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import {
  Mermaid,
  MermaidDiagrams,
  MermaidPreview,
} from "@editorcn/extensions/mermaid";
import { MermaidToolbar } from "@editorcn/extensions/mermaid-toolbar";
import { StaticRenderer } from "@editorcn/static-renderer";
import type { CodeHighlighter } from "@editorcn/static-renderer";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import type { Node } from "@tiptap/pm/model";
import { useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as ImageIcon, Eye } from "lucide-react";
import { useEffect, useState } from "react";

import { showImagePrompt } from "@/components/image-prompt";

import "@editorcn/editor/style.css";
import "@editorcn/static-renderer/style.css";

const CONTENT = `
<h1>Writing on the web</h1>
<h2>Why prose matters</h2>
<p>
  Your saved document can be rendered anywhere — a blog post, an email, a chat
  message, a print view. The <strong>StaticRenderer</strong> styles the exact
  HTML the editor serializes, so it keeps your <em>typesetting</em> without
  needing a markdown pipeline.
</p>
<img src="/og.png" alt="editorcn">
<p>
  Every <code>image</code> node is intercepted in the JSON pane through
  <code>nodeMapping</code> and rendered by a component instead of plain markup.
</p>
<ul>
  <li>Headings and paragraphs</li>
  <li>Lists, nesting, and inline <code>code</code></li>
  <li>
    Links like the <a href="https://www.rtecn.space">project site</a>
  </li>
</ul>
<ol>
  <li>Write in the editor</li>
  <li>Save <code>editor.getHTML()</code></li>
  <li>Render it with <code>StaticRenderer</code> — read only</li>
</ol>
<ul>
  <li>
    Nested lists
    <ul>
      <li>… nest just like you would in the editor</li>
    </ul>
  </li>
</ul>
<blockquote>
  <p>Good typography is invisible, and that visible page is all that matters.</p>
</blockquote>
<hr>
<p>
  Block elements and inline styles pass through untouched, so you can keep
  <strong>emphasis</strong>, <em>italics</em>, <u>underlines</u>, or
  <s>struck-through</s> text exactly as the author left it.
</p>
<p>
  Mermaid diagrams keep their source in the HTML. The HTML pane draws them by
  wrapping the renderer in <code>MermaidDiagrams</code>, and the JSON pane maps
  the node to <code>MermaidPreview</code>.
</p>
<div data-type="mermaid"><pre><code class="language-mermaid">graph LR
  A[Editor] --&gt; B[Saved HTML or JSON]
  B --&gt; C[StaticRenderer]</code></pre></div>
<pre><code class="language-typescript">export const isOnboardingV2 = (team: Team) =&gt;
  flags.enabled("onboarding-v2", { teamId: team.id });</code></pre>
`.trim();

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: false,
    underline: false,
  }),
  Image,
  Mermaid,
  Underline,
  Link,
  Placeholder.configure({ placeholder: "Start typing..." }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

const DemoImage = ({ node }: { node: Node }) => (
  <figure className="my-4">
    <img
      src={node.attrs.src}
      alt={node.attrs.alt}
      className="w-full rounded-lg border border-border"
    />
    <figcaption className="mt-2 text-center text-xs text-muted-foreground">
      Rendered by a custom nodeMapping component
    </figcaption>
  </figure>
);

export const StaticRendererDemo = () => {
  const [doc, setDoc] = useState(CONTENT);
  const [json, setJson] = useState<JSONContent | null>(null);
  const [highlighter, setHighlighter] = useState<CodeHighlighter>();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { createHighlighter } = await import("shiki");
      const instance = await createHighlighter({
        langs: ["typescript"],
        themes: ["github-light", "github-dark"],
      });
      if (active) {
        setHighlighter(instance);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const editor = useEditor({
    content: CONTENT,
    extensions,
    immediatelyRender: false,
    onCreate: ({ editor: ed }) => setJson(ed.getJSON()),
    onUpdate: ({ editor: ed }) => {
      setDoc(ed.getHTML());
      setJson(ed.getJSON());
    },
    shouldRerenderOnTransaction: false,
  });

  const changeImage = (url: string) => {
    if (editor && !editor.isDestroyed) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleImageClick = async () => {
    const url = await showImagePrompt();
    if (url) {
      changeImage(url);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Control
                title="Insert or replace image"
                onClick={handleImageClick}
              >
                <ImageIcon className="size-4" />
              </RichTextEditor.Control>
              <MermaidToolbar editor={editor} />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.BubbleMenu editor={editor} />
          <RichTextEditor.Content />
        </RichTextEditor>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <Eye className="size-4" />
            Static output — HTML
          </div>
          <div className="p-5">
            <MermaidDiagrams>
              <StaticRenderer
                content={doc}
                highlighter={highlighter}
                sanitize
              />
            </MermaidDiagrams>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <Eye className="size-4" />
            Static output — JSON
          </div>
          <div className="p-5">
            {json && (
              <StaticRenderer
                content={json}
                extensions={extensions}
                highlighter={highlighter}
                options={{
                  nodeMapping: {
                    image: ({ node }) => <DemoImage node={node} />,
                    mermaid: ({ node }) => (
                      <div data-type="mermaid">
                        <MermaidPreview value={node.attrs.value} />
                      </div>
                    ),
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
