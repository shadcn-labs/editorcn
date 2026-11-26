import { createElement } from "react";
import type { CSSProperties, ReactNode } from "react";

export const CODE_THEMES = { dark: "github-dark", light: "github-light" };

export interface CodeHighlighter {
  codeToTokens(
    code: string,
    options: {
      defaultColor?: string | false;
      lang?: string;
      themes?: Record<string, unknown>;
    }
  ): { tokens: { content: string; htmlStyle?: Record<string, string> }[][] };
  getLoadedLanguages(): string[];
  getLoadedThemes(): string[];
}

interface HighlightedToken {
  content: string;
  style: Record<string, string>;
}

const PLAIN = new Set(["plaintext", "text", "txt", "plain"]);
const STYLE_KEY = /^--shiki-(light|dark)(-[a-z-]+)?$/;
const STYLE_VALUE = /^[#\w(),.%\s-]+$/;

const canHighlight = (highlighter: CodeHighlighter, language: string) =>
  Boolean(language) &&
  !PLAIN.has(language) &&
  highlighter.getLoadedLanguages().includes(language) &&
  Object.values(CODE_THEMES).every((theme) =>
    highlighter.getLoadedThemes().includes(theme)
  );

const toTokens = (
  highlighter: CodeHighlighter,
  code: string,
  language: string
): HighlightedToken[][] | null => {
  if (!canHighlight(highlighter, language)) {
    return null;
  }
  const { tokens } = highlighter.codeToTokens(code, {
    defaultColor: false,
    lang: language,
    themes: CODE_THEMES,
  });
  return tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      style: Object.fromEntries(
        Object.entries(token.htmlStyle ?? {}).filter(
          ([key, value]) => STYLE_KEY.test(key) && STYLE_VALUE.test(value)
        )
      ),
    }))
  );
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const decodeEntities = (value: string) =>
  value.replaceAll(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(body.slice(2), 16));
    }
    if (body.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(body.slice(1), 10));
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
  });

const languageFromClass = (className: string | undefined) =>
  className?.match(/(?:^|\s)language-([\w+#-]+)/)?.[1] ?? "";

const CODE_BLOCK = /<pre([^>]*)><code([^>]*)>([^<]*)<\/code><\/pre>/g;

export const highlightCodeBlocksInHtml = (
  html: string,
  highlighter: CodeHighlighter
) =>
  html.replaceAll(
    CODE_BLOCK,
    (block, preAttrs: string, codeAttrs: string, body: string) => {
      const language = languageFromClass(
        codeAttrs.match(/\sclass="([^"]*)"/)?.[1]
      );
      const lines = toTokens(highlighter, decodeEntities(body), language);
      if (!lines) {
        return block;
      }
      const inner = lines
        .map((line) =>
          line
            .map(({ content, style }) => {
              const css = Object.entries(style)
                .map(([key, value]) => `${key}:${value}`)
                .join(";");
              return css
                ? `<span style="${css}">${escapeHtml(content)}</span>`
                : escapeHtml(content);
            })
            .join("")
        )
        .join("\n");
      return `<pre${preAttrs}><code${codeAttrs}>${inner}</code></pre>`;
    }
  );

export const renderHighlightedCode = (
  highlighter: CodeHighlighter,
  code: string,
  language: string
): ReactNode => {
  const lines = toTokens(highlighter, code, language);
  if (!lines) {
    return code;
  }
  return lines.flatMap((line, lineIndex) => [
    ...(lineIndex > 0 ? ["\n"] : []),
    ...line.map(({ content, style }, tokenIndex) =>
      Object.keys(style).length > 0
        ? createElement(
            "span",
            {
              key: `${lineIndex}-${tokenIndex}`,
              style: style as CSSProperties,
            },
            content
          )
        : content
    ),
  ]);
};
