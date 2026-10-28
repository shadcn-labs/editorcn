import type { JSONContent } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { StarterKit } from "@tiptap/starter-kit";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { sanitizeHtml } from "./sanitize";
import { StaticRenderer } from "./static-renderer";

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({
  text: value,
  type: "text",
  ...(marks ? { marks } : {}),
});
const paragraph = (value: string): JSONContent => ({
  content: [text(value)],
  type: "paragraph",
});

const editorDocument: JSONContent = {
  content: [
    {
      attrs: { level: 2, textAlign: "center" },
      content: [text("Heading")],
      type: "heading",
    },
    {
      attrs: { textAlign: "justify" },
      content: [
        text("bold", [{ type: "bold" }]),
        text("italic", [{ type: "italic" }]),
        text("underline", [{ type: "underline" }]),
        text("strike", [{ type: "strike" }]),
        text("code", [{ type: "code" }]),
        text("link", [
          {
            attrs: { href: "https://example.com", target: "_blank" },
            type: "link",
          },
        ]),
        text("highlight", [{ attrs: { color: "#fef08a" }, type: "highlight" }]),
        text("styled", [
          {
            attrs: {
              backgroundColor: "#eeeeee",
              color: "#ff0000",
              fontFamily: "Inter",
              fontSize: "18px",
              lineHeight: "1.5",
            },
            type: "textStyle",
          },
        ]),
        text("sub", [{ type: "subscript" }]),
        text("sup", [{ type: "superscript" }]),
        { type: "hardBreak" },
        text("after break"),
      ],
      type: "paragraph",
    },
    {
      content: [{ content: [paragraph("bullet")], type: "listItem" }],
      type: "bulletList",
    },
    {
      attrs: { start: 3 },
      content: [{ content: [paragraph("ordered")], type: "listItem" }],
      type: "orderedList",
    },
    {
      content: [
        {
          attrs: { checked: true },
          content: [paragraph("task")],
          type: "taskItem",
        },
      ],
      type: "taskList",
    },
    { content: [paragraph("quote")], type: "blockquote" },
    {
      attrs: { language: "ts" },
      content: [text("const a = 1;")],
      type: "codeBlock",
    },
    { type: "horizontalRule" },
    {
      attrs: {
        alt: "alt",
        height: 100,
        src: "https://example.com/a.png",
        title: "title",
        width: 200,
      },
      type: "image",
    },
    {
      content: [
        {
          content: [
            {
              attrs: { colwidth: [100] },
              content: [paragraph("header")],
              type: "tableHeader",
            },
            { content: [paragraph("header 2")], type: "tableHeader" },
          ],
          type: "tableRow",
        },
        {
          content: [
            {
              attrs: { colspan: 2 },
              content: [paragraph("cell")],
              type: "tableCell",
            },
          ],
          type: "tableRow",
        },
      ],
      type: "table",
    },
  ],
  type: "doc",
};

const extensions = [
  StarterKit,
  Highlight.configure({ multicolor: true }),
  TextStyleKit,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TableKit,
  TaskList,
  TaskItem.configure({ nested: true }),
  Image,
  Subscript,
  Superscript,
];

const embeds = [
  '<div data-type="youtube" data-src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-width="560" data-height="315" data-align="center"></div>',
  '<div data-type="twitter" data-tweet-id="123456789" data-width="550" data-height="400" data-align="center"></div>',
  '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="480" allowfullscreen="true"></iframe></div>',
  '<img src="data:image/png;base64,iVBORw0KGgo=" alt="upload">',
].join("");

const shape = (html: string) =>
  [...html.matchAll(/<(\/?[a-z0-9]+)([^>]*)>/gi)].map(([, tag, attrs]) =>
    [
      tag,
      ...((attrs ?? "").replaceAll(/"[^"]*"/g, "").match(/[a-z-]+/gi) ?? []),
    ]
      .toSorted()
      .join(" ")
  );

describe(sanitizeHtml, () => {
  it("keeps every tag and attribute the editors produce", () => {
    const html =
      renderToHTMLString({ content: editorDocument, extensions }) + embeds;
    const sanitized = sanitizeHtml(html);

    expect(shape(sanitized)).toStrictEqual(shape(html));
    expect(sanitized).toContain("line-height:1.5");
    expect(sanitized).toContain('href="https://example.com"');
  });

  it.each([
    ["<img onerror>", '<img src="x" onerror="alert(1)">', /onerror/i],
    ["<script>", "<p>hi</p><script>alert(1)</script>", /script|alert/i],
    [
      "link to a javascript: URL",
      '<a href="javascript:alert(1)">x</a>',
      /javascript/i,
    ],
    [
      "encoded javascript: link",
      '<a href="&#106;ava&#x73;cript&colon;alert(1)">x</a>',
      /href="[^"]/i,
    ],
    [
      "whitespace inside javascript:",
      '<a href=" java\tscript:alert(1)">x</a>',
      /script/i,
    ],
    [
      "data: link",
      '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
      /data:/i,
    ],
    [
      "svg data: image",
      '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
      /data:/i,
    ],
    [
      "entity-encoded svg data: image",
      '<img src="&#100;ata:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
      /svg/i,
    ],
    [
      "entity-encoded data: link",
      '<a href="&#x64;&#x61;ta&colon;image/png;base64,AAAA">x</a>',
      /href="[^"]/i,
    ],
    [
      "<svg onload>",
      "<svg onload=alert(1)><circle r=1 /></svg>",
      /svg|onload/i,
    ],
    [
      "<svg><script>",
      "<svg><script>alert(1)</script></svg>",
      /svg|script|alert/i,
    ],
    [
      "iframe from unknown host",
      '<iframe src="https://evil.example/x"></iframe>',
      /evil/i,
    ],
    [
      "iframe javascript:",
      '<iframe src="javascript:alert(1)"></iframe>',
      /javascript/i,
    ],
    [
      "iframe srcdoc",
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
      /srcdoc|script/i,
    ],
    [
      "<object>",
      '<object data="https://evil.example/x.swf"></object>',
      /object|evil/i,
    ],
    ["<embed>", '<embed src="https://evil.example/x.swf">', /embed|evil/i],
    [
      "<form>",
      '<form action="https://evil.example"><button>Go</button></form>',
      /form|button|evil/i,
    ],
    ["<style>", "<style>body{display:none}</style><p>x</p>", /style|display/i],
    [
      "style url()",
      '<p style="background:url(javascript:alert(1))">x</p>',
      /url|javascript/i,
    ],
    [
      "fixed overlay",
      '<div style="position:fixed;inset:0;z-index:9999">x</div>',
      /position|z-index/i,
    ],
    ["event handler", '<p onclick="alert(1)">x</p>', /onclick/i],
    [
      "<meta refresh>",
      '<meta http-equiv="refresh" content="0;url=https://evil.example">',
      /meta|evil/i,
    ],
    ["<base href>", '<base href="https://evil.example/">', /base|evil/i],
    ["broken quotes", '<img src="x" alt="a"onerror="alert(1)">', /onerror/i],
    ["mixed case tag", "<ScRiPt>alert(1)</sCrIpT>", /script|alert/i],
    [
      "comment breakout",
      "<!--<img src=x onerror=alert(1)>-->",
      /<img|onerror/i,
    ],
  ])("strips %s", (_name, payload, forbidden) => {
    expect(payload).toMatch(forbidden);
    expect(sanitizeHtml(payload)).not.toMatch(forbidden);
  });

  it("keeps iframes from known embed hosts", () => {
    const html =
      '<iframe src="https://player.vimeo.com/video/1" width="640"></iframe>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("keeps mention attributes", () => {
    const html =
      '<p><span data-type="mention" data-id="3" data-label="Grace" data-mention-suggestion-char="@">@Grace</span></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});

describe("StaticRenderer sanitize prop", () => {
  const payload = '<p>safe</p><img src="x" onerror="alert(1)">';

  it("renders on the server without window", () => {
    expect("window" in globalThis).toBeFalsy();
    const markup = renderToStaticMarkup(
      createElement(StaticRenderer, { content: payload, sanitize: true })
    );
    expect(markup).toContain("<p>safe</p>");
    expect(markup).not.toMatch(/onerror/i);
  });

  it("uses a custom sanitizer function", () => {
    const custom = vi.fn<(html: string) => string>(() => "<p>custom</p>");
    const markup = renderToStaticMarkup(
      createElement(StaticRenderer, { content: payload, sanitize: custom })
    );
    expect(custom).toHaveBeenCalledWith(payload);
    expect(markup).toContain("<p>custom</p>");
  });

  it("warns once in development when sanitize is not set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const render = (sanitize?: boolean) =>
      renderToStaticMarkup(
        createElement(StaticRenderer, { content: payload, sanitize })
      );

    render(false);
    expect(warn).not.toHaveBeenCalled();
    render();
    render();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
