export type Format = "html" | "json" | "markdown";

export const FORMAT_LABEL: Record<Format, string> = {
  html: "HTML",
  json: "Tiptap JSON",
  markdown: "Markdown",
};

export interface Tool {
  description: string;
  docs: { href: string; label: string };
  faq: { answer: string; question: string }[];
  from: Format;
  intro: string;
  sample: string;
  seoTitle: string;
  slug: string;
  title: string;
  to: Format;
}

const SAMPLE_HTML = `<h2>Release notes</h2>
<p>This release adds <strong>markdown support</strong>, <em>faster tables</em>, and a <a href="https://www.rtecn.space/docs">new docs site</a>.</p>
<ul>
  <li>Paste markdown straight into the editor</li>
  <li>Export any document as <code>.md</code></li>
</ul>
<blockquote><p>Upgrade with one command.</p></blockquote>
<pre><code class="language-bash">npx shadcn@latest add @editorcn/editor</code></pre>`;

const SAMPLE_MARKDOWN = `## Release notes

This release adds **markdown support**, *faster tables*, and a [new docs site](https://www.rtecn.space/docs).

- Paste markdown straight into the editor
- Export any document as \`.md\`

- [x] Tables
- [ ] Comments

| Feature | Status |
| --- | --- |
| Markdown | Shipped |
| Mentions | Shipped |

> Upgrade with one command.

\`\`\`bash
npx shadcn@latest add @editorcn/editor
\`\`\``;

const SAMPLE_JSON = JSON.stringify(
  {
    content: [
      {
        attrs: { level: 2 },
        content: [{ text: "Release notes", type: "text" }],
        type: "heading",
      },
      {
        content: [
          { text: "This release adds ", type: "text" },
          { marks: [{ type: "bold" }], text: "markdown support", type: "text" },
          { text: " and ", type: "text" },
          { marks: [{ type: "italic" }], text: "faster tables", type: "text" },
          { text: ".", type: "text" },
        ],
        type: "paragraph",
      },
      {
        content: [
          {
            content: [
              {
                content: [
                  { text: "Paste markdown into the editor", type: "text" },
                ],
                type: "paragraph",
              },
            ],
            type: "listItem",
          },
        ],
        type: "bulletList",
      },
    ],
    type: "doc",
  },
  null,
  2
);

const MARKDOWN_DOCS = {
  href: "/docs/extensions/markdown",
  label: "Markdown extension",
};
const RENDERER_DOCS = {
  href: "/docs/static-renderer",
  label: "Static Renderer",
};
const SERIALIZATION_DOCS = {
  href: "/docs/editor/serialization-format",
  label: "serialization format",
};

export const TOOLS: Tool[] = [
  {
    description:
      "Free online HTML to Markdown converter. Paste HTML and get clean GitHub-flavored Markdown with tables, task lists, links, and code blocks. Runs in your browser.",
    docs: MARKDOWN_DOCS,
    faq: [
      {
        answer:
          "No. The conversion runs entirely in your browser with Tiptap, so your HTML never leaves your device.",
        question: "Is my HTML uploaded anywhere?",
      },
      {
        answer:
          "Headings, paragraphs, bold, italic, strikethrough, inline code, links, images, lists, task lists, blockquotes, code blocks, horizontal rules, and tables.",
        question: "Which HTML elements are supported?",
      },
      {
        answer:
          "Tags with no Markdown equivalent, such as div, span, or inline styles, are reduced to their text content so the output stays clean.",
        question: "What happens to unsupported tags?",
      },
    ],
    from: "html",
    intro:
      "Paste HTML on the left and copy clean Markdown on the right. Useful for moving content out of a CMS, cleaning up rich text, or saving editor output as .md files.",
    sample: SAMPLE_HTML,
    seoTitle: "HTML to Markdown Converter (Free, Online)",
    slug: "html-to-markdown",
    title: "HTML to Markdown Converter",
    to: "markdown",
  },
  {
    description:
      "Free online Markdown to HTML converter with live preview. Supports GitHub-flavored Markdown: tables, task lists, code blocks, and links. Runs in your browser.",
    docs: MARKDOWN_DOCS,
    faq: [
      {
        answer:
          "Yes. Tables, task lists, strikethrough, and fenced code blocks from GitHub-flavored Markdown are all converted.",
        question: "Does it support GitHub-flavored Markdown?",
      },
      {
        answer:
          "No. Everything runs locally in your browser, so nothing you paste is sent to a server.",
        question: "Is my Markdown sent to a server?",
      },
      {
        answer:
          "The HTML is produced by a Tiptap editor schema, so it only contains well-formed, semantic tags with no inline styles.",
        question: "Is the HTML output clean?",
      },
    ],
    from: "markdown",
    intro:
      "Write or paste Markdown and get semantic HTML with a live preview. The output is ready to drop into a page, an email, or a rich text editor.",
    sample: SAMPLE_MARKDOWN,
    seoTitle: "Markdown to HTML Converter with Live Preview",
    slug: "markdown-to-html",
    title: "Markdown to HTML Converter",
    to: "html",
  },
  {
    description:
      "Convert Markdown to Tiptap JSON (ProseMirror JSON) online. Get a document you can pass to editor.commands.setContent() or store in your database.",
    docs: SERIALIZATION_DOCS,
    faq: [
      {
        answer:
          "It is the ProseMirror document format Tiptap returns from editor.getJSON(). Each node has a type, optional attrs, and a content array.",
        question: "What is Tiptap JSON?",
      },
      {
        answer:
          "Store JSON when you need to edit content later or render custom nodes. It keeps every attribute and is easy to migrate.",
        question: "Should I store JSON or HTML?",
      },
      {
        answer:
          "Pass it to editor.commands.setContent(json) or to the content option when creating the editor.",
        question: "How do I load the JSON into my editor?",
      },
    ],
    from: "markdown",
    intro:
      "Turn Markdown into the JSON document Tiptap and ProseMirror use internally. Handy for seeding an editor, writing tests, or migrating Markdown content into a database.",
    sample: SAMPLE_MARKDOWN,
    seoTitle: "Markdown to Tiptap JSON Converter",
    slug: "markdown-to-tiptap-json",
    title: "Markdown to Tiptap JSON Converter",
    to: "json",
  },
  {
    description:
      "Convert HTML to Tiptap JSON (ProseMirror JSON) online. See exactly how Tiptap parses your HTML and copy a document ready for setContent().",
    docs: SERIALIZATION_DOCS,
    faq: [
      {
        answer:
          "Tiptap only keeps what its schema knows. Unknown tags are dropped or turned into paragraphs, which is why the JSON can look simpler than the HTML.",
        question: "Why is some of my HTML missing from the JSON?",
      },
      {
        answer:
          "This tool uses StarterKit plus images, tables, and task lists. Your app may register different extensions, so its output can differ.",
        question: "Which extensions are used?",
      },
      {
        answer: "No. Parsing happens in your browser and nothing is uploaded.",
        question: "Is my content uploaded?",
      },
    ],
    from: "html",
    intro:
      "Paste HTML and see the Tiptap JSON it becomes. Use it to debug why content changes after loading it into an editor, or to convert stored HTML into JSON.",
    sample: SAMPLE_HTML,
    seoTitle: "HTML to Tiptap JSON Converter",
    slug: "html-to-tiptap-json",
    title: "HTML to Tiptap JSON Converter",
    to: "json",
  },
  {
    description:
      "Free Tiptap JSON viewer. Paste a Tiptap or ProseMirror JSON document to preview it and convert it to clean HTML you can render anywhere.",
    docs: RENDERER_DOCS,
    faq: [
      {
        answer:
          "Paste the output of editor.getJSON(). The document must have a doc node at the root with a content array.",
        question: "What JSON can I paste?",
      },
      {
        answer:
          "Use the editorcn Static Renderer to render saved JSON or HTML as styled, read-only React without mounting an editor.",
        question: "How do I render Tiptap JSON in production?",
      },
      {
        answer:
          "The document uses a node type this tool doesn't register. Custom nodes need their extension to be converted.",
        question: "Why do I get an error?",
      },
    ],
    from: "json",
    intro:
      "Paste Tiptap JSON to preview the document and copy its HTML. A quick way to inspect what is stored in your database without spinning up an editor.",
    sample: SAMPLE_JSON,
    seoTitle: "Tiptap JSON to HTML Converter and Viewer",
    slug: "tiptap-json-to-html",
    title: "Tiptap JSON to HTML Converter",
    to: "html",
  },
];

export const getTool = (slug: string) =>
  TOOLS.find((tool) => tool.slug === slug);
