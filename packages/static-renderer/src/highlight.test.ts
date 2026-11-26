import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CodeHighlighter } from "./highlight";
import { highlightCodeBlocksInHtml } from "./highlight";
import { StaticRenderer } from "./static-renderer";

const KEYWORDS = new Set(["const", "export"]);

const fakeHighlighter = (
  languages = ["typescript"],
  themes = ["github-light", "github-dark"]
): CodeHighlighter => ({
  codeToTokens: (code) => ({
    tokens: code.split("\n").map((line) =>
      line.split(/(\s+)/).flatMap((content) =>
        content
          ? [
              KEYWORDS.has(content)
                ? {
                    content,
                    htmlStyle: {
                      "--shiki-dark": "#F97583",
                      "--shiki-light": "#D73A49",
                      "background-image": "url(evil)",
                    },
                  }
                : { content },
            ]
          : []
      )
    ),
  }),
  getLoadedLanguages: () => languages,
  getLoadedThemes: () => themes,
});

const codeBlock = (language: string | null, text: string): JSONContent => ({
  attrs: { language },
  content: [{ text, type: "text" }],
  type: "codeBlock",
});

const doc = (...content: JSONContent[]): JSONContent => ({
  content,
  type: "doc",
});

describe(highlightCodeBlocksInHtml, () => {
  it("adds theme colors to code blocks in a loaded language", () => {
    const html =
      '<pre data-wrap=""><code class="language-typescript">export const a = 1;</code></pre>';
    expect(highlightCodeBlocksInHtml(html, fakeHighlighter())).toBe(
      '<pre data-wrap=""><code class="language-typescript"><span style="--shiki-dark:#F97583;--shiki-light:#D73A49">export</span> <span style="--shiki-dark:#F97583;--shiki-light:#D73A49">const</span> a = 1;</code></pre>'
    );
  });

  it("decodes the escaped code and escapes it again", () => {
    const html =
      '<pre><code class="language-typescript">const a = b &lt; c &amp;&amp; "x";</code></pre>';
    const result = highlightCodeBlocksInHtml(html, fakeHighlighter());
    expect(result).toContain("b &lt; c &amp;&amp; &quot;x&quot;;");
    expect(result).not.toContain("b < c");
  });

  it("keeps multi-line code on separate lines", () => {
    const html =
      '<pre><code class="language-typescript">const a = 1;\nconst b = 2;</code></pre>';
    const result = highlightCodeBlocksInHtml(html, fakeHighlighter());
    expect(result.split("\n")).toHaveLength(2);
  });

  it("leaves blocks alone when the language or themes are not loaded", () => {
    const html =
      '<pre><code class="language-python">const a = 1;</code></pre><pre><code>const b;</code></pre>';
    expect(highlightCodeBlocksInHtml(html, fakeHighlighter())).toBe(html);
    const typescript =
      '<pre><code class="language-typescript">const a;</code></pre>';
    expect(
      highlightCodeBlocksInHtml(
        typescript,
        fakeHighlighter(["typescript"], ["github-dark"])
      )
    ).toBe(typescript);
  });

  it("drops styles other than the Shiki theme variables", () => {
    const html = '<pre><code class="language-typescript">const a;</code></pre>';
    expect(highlightCodeBlocksInHtml(html, fakeHighlighter())).not.toContain(
      "url("
    );
  });

  it("skips code blocks that contain markup", () => {
    const html =
      '<pre><code class="language-typescript">const <b>a</b>;</code></pre>';
    expect(highlightCodeBlocksInHtml(html, fakeHighlighter())).toBe(html);
  });
});

describe("StaticRenderer highlighter", () => {
  it("highlights code blocks in HTML after sanitizing", () => {
    const markup = renderToStaticMarkup(
      createElement(StaticRenderer, {
        content:
          '<pre data-wrap=""><code class="language-typescript">const a;</code></pre><img src="x" onerror="alert(1)">',
        highlighter: fakeHighlighter(),
        sanitize: true,
      })
    );
    expect(markup).toContain("<pre data-wrap>");
    expect(markup).toContain(
      '<span style="--shiki-dark:#F97583;--shiki-light:#D73A49">const</span>'
    );
    expect(markup).not.toContain("onerror");
  });

  it("highlights code blocks in JSON content", () => {
    const markup = renderToStaticMarkup(
      createElement(StaticRenderer, {
        content: doc(codeBlock("typescript", "const a = 1;\nexport b")),
        extensions: [StarterKit],
        highlighter: fakeHighlighter(),
      })
    );
    expect(markup).toContain('<code class="language-typescript">');
    expect(markup).toContain(
      '<span style="--shiki-dark:#F97583;--shiki-light:#D73A49">const</span> a = 1;\n<span'
    );
  });

  it("renders plain code for languages that are not loaded", () => {
    const markup = renderToStaticMarkup(
      createElement(StaticRenderer, {
        content: doc(codeBlock("python", "const a")),
        extensions: [StarterKit],
        highlighter: fakeHighlighter(),
      })
    );
    expect(markup).toContain(
      '<pre><code class="language-python">const a</code></pre>'
    );
  });

  it("keeps a codeBlock mapping passed in options", () => {
    const markup = renderToStaticMarkup(
      createElement(StaticRenderer, {
        content: doc(codeBlock("typescript", "const a")),
        extensions: [StarterKit],
        highlighter: fakeHighlighter(),
        options: {
          nodeMapping: {
            codeBlock: () => createElement("div", { id: "custom" }),
          },
        },
      })
    );
    expect(markup).toContain('<div id="custom"></div>');
  });
});
