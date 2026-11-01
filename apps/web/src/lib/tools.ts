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
          "The HTML is produced by a Tiptap editor schema, so it only contains well-formed, semantic tags. The only inline styles are column widths on tables.",
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

export interface ToolSection {
  heading: string;
  items?: string[];
  paragraphs?: string[];
}

export const TOOL_SECTIONS: Record<string, ToolSection[]> = {
  "html-to-markdown": [
    {
      heading: "What gets converted",
      items: [
        "Headings h1 to h6 become # to ###### headings.",
        "strong and b become **bold**, em and i become *italic*, s and del become ~~strikethrough~~.",
        "Links become [text](url) and images become ![alt](src).",
        "Bulleted and numbered lists become - and 1. lists, and nested lists keep their indentation.",
        "Tiptap task lists become GitHub task lists: - [ ] and - [x].",
        "Tables become GitHub-flavored Markdown pipe tables.",
        "pre and code become fenced code blocks, blockquote becomes >, and hr becomes ---.",
      ],
    },
    {
      heading: "Why convert HTML to Markdown?",
      paragraphs: [
        "Markdown is smaller and easier to read than HTML. It diffs cleanly in git, works in README files and static site generators like Astro, Hugo, and Next.js with MDX, and uses fewer tokens when you pass content to an LLM.",
        "It is also a common export format. If your app stores rich text as HTML, offering a Markdown download lets people move their content into note apps, docs tools, and code repositories.",
      ],
    },
    {
      heading: "Cleaning up messy HTML",
      paragraphs: [
        "HTML copied from Google Docs, Word, or a CMS is full of span tags, classes, and inline styles. This converter parses your HTML through a Tiptap schema first, so anything without meaning is dropped and only the text and its structure are kept.",
        "Text color, alignment, and font settings have no Markdown syntax, so they are removed. GitHub-flavored Markdown tables also can't express merged cells, so keep tables simple if you need a clean round trip.",
      ],
    },
  ],
  "html-to-tiptap-json": [
    {
      heading: "Why does my HTML change in Tiptap?",
      paragraphs: [
        "Tiptap doesn't keep raw HTML. It parses your markup against a schema made from the extensions you register. Tags the schema knows become nodes and marks, and everything else is dropped or turned into plain paragraphs.",
        "That is why div wrappers disappear, classes are removed, and inline styles vanish unless an extension like TextStyle, Color, or TextAlign is registered to read them. Paste your HTML here to see exactly what survives.",
      ],
    },
    {
      heading: "Migrating stored HTML to JSON",
      paragraphs: [
        "If your database stores editor content as HTML, moving to JSON makes it easier to query, transform, and render custom nodes. The migration is a loop: load each record with editor.commands.setContent(html), read editor.getJSON(), and save the result.",
        "On the server, use generateJSON from @tiptap/html with the same extensions as your editor. Using the same extension list on both sides is what keeps the output identical.",
      ],
    },
    {
      heading: "Reading the output",
      items: [
        "Every document starts with a doc node and a content array.",
        "Block nodes like paragraph, heading, bulletList, and table hold other nodes in content.",
        "Attributes such as a heading level or an image src live in attrs.",
        "Text nodes carry formatting in a marks array, for example bold, italic, or a link with an href.",
      ],
    },
  ],
  "markdown-to-html": [
    {
      heading: "Supported Markdown syntax",
      items: [
        "Headings, paragraphs, bold, italic, and inline code.",
        "Links and images.",
        "Bulleted, numbered, and nested lists.",
        "Blockquotes and horizontal rules.",
        "GitHub-flavored extras: tables, task lists, strikethrough, and fenced code blocks with a language.",
      ],
    },
    {
      heading: "Where to use the HTML",
      paragraphs: [
        "Paste the output into CMS fields and email templates that only accept HTML, or load it into a rich text editor that expects HTML content.",
        "In a React app you can render saved HTML with the editorcn Static Renderer, which styles the content to match your shadcn/ui theme and can sanitize it for you.",
      ],
    },
    {
      heading: "A note on security",
      paragraphs: [
        "HTML that comes from users should be sanitized before you render it with dangerouslySetInnerHTML. Use a library like DOMPurify, or the sanitize prop on the Static Renderer, so links and attributes can't run scripts.",
      ],
    },
  ],
  "markdown-to-tiptap-json": [
    {
      heading: "Understanding the JSON structure",
      items: [
        "The root is always a doc node with a content array.",
        "A heading is a node with attrs.level, and a paragraph holds text nodes.",
        "Lists nest: bulletList contains listItem, which contains a paragraph.",
        "Formatting lives on text nodes as marks, for example bold, italic, code, or a link with attrs.href.",
      ],
    },
    {
      heading: "When to store JSON instead of Markdown",
      paragraphs: [
        "JSON keeps everything the editor knows, such as mention ids, image sizes, and table structure. It loads into Tiptap without parsing and is easy to walk in code, which helps with search indexing, sending notifications for mentions, or migrating content with a script.",
        "Markdown is better when people edit files by hand or keep content in git. Many apps store JSON and export Markdown when a user asks for it.",
      ],
    },
    {
      heading: "Seeding an editor with the output",
      paragraphs: [
        "Pass the JSON as the content option of useEditor, or to editor.commands.setContent(json). It also works well as fixture data for tests and Storybook stories.",
        "Every node in the JSON must have a matching extension in your editor. This tool uses StarterKit plus images, tables, and task lists, so register those if your content uses them.",
      ],
    },
  ],
  "tiptap-json-to-html": [
    {
      heading: "Inspect what's in your database",
      paragraphs: [
        "Tiptap JSON is hard to read once it's a few levels deep. Paste a stored document here to see it rendered, and spot problems like empty paragraphs, stray marks, or broken links without starting your app.",
      ],
    },
    {
      heading: "Rendering Tiptap JSON in production",
      items: [
        "generateHTML from @tiptap/html turns JSON into an HTML string on the server.",
        "The editorcn Static Renderer renders JSON or HTML as styled React and lets you map custom nodes to your own components.",
        "A read-only Tiptap editor works too, but it ships the whole editor to the browser just to show content.",
      ],
    },
    {
      heading: "Common errors",
      items: [
        "Invalid JSON content: the document uses a node or mark that isn't registered, or a node is missing required content.",
        "A JSON syntax error: the text itself is malformed, often because of a trailing comma or a missing quote.",
      ],
    },
  ],
};
