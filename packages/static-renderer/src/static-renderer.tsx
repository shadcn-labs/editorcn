import type { Extensions, JSONContent } from "@tiptap/core";
import type { Mark, Node } from "@tiptap/pm/model";
import { renderToReactElement } from "@tiptap/static-renderer";
import type {
  StaticEditorOptions,
  TiptapStaticRendererOptions,
} from "@tiptap/static-renderer";
import { createElement } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

import type { CodeHighlighter } from "./highlight";
import { highlightCodeBlocksInHtml, renderHighlightedCode } from "./highlight";
import { cn } from "./lib/utils";
import { sanitizeHtml } from "./sanitize";

// HTML strings go through dangerouslySetInnerHTML, so they are sanitized
// unless the caller opts out with `sanitize={false}` for trusted HTML.
const toSafeHtml = (
  html: string,
  sanitize: StaticRendererProps["sanitize"] = true
) => {
  if (typeof sanitize === "function") {
    return sanitize(html);
  }
  return sanitize ? sanitizeHtml(html) : html;
};

const resolveUniqueExtensions = (extensions: Extensions) => {
  const byName = new Map<string, (typeof extensions)[number]>();
  for (const extension of extensions) {
    byName.set(extension.name, extension);
  }
  return [...byName.values()];
};

export type StaticRendererPreset =
  | "document"
  | "block"
  | (string & Record<never, never>);

export type StaticRendererProps = Omit<
  HTMLAttributes<HTMLElement>,
  "content" | "dangerouslySetInnerHTML"
> & {
  // HTML from editor.getHTML() rendered read-only, or a ProseMirror JSON document.
  content: string | JSONContent | Node;
  // Root element, defaults to "div".
  as?: ElementType;
  // Tiptap extensions used to render JSON content; every node/mark in the document must be registered.
  extensions?: Extensions;
  // Editor-level options applied while rendering JSON.
  staticEditorOptions?: StaticEditorOptions;
  // renderToReactElement options — nodeMapping/markMapping for custom nodes.
  options?: Partial<TiptapStaticRendererOptions<ReactNode, Mark, Node>>;
  // HTML mode only. Defaults to true (built-in allowlist). Pass a function for
  // your own sanitizer, or false to render trusted HTML as-is.
  sanitize?: boolean | ((html: string) => string);
  // Content preset, defaults to "block". Use "document" for RichTextEditor output.
  preset?: StaticRendererPreset;
  // A Shiki highlighter with the github-light and github-dark themes loaded; code blocks in loaded languages get the editor's syntax colors.
  highlighter?: CodeHighlighter;
};

const codeBlockMapping = (highlighter: CodeHighlighter) => {
  const HighlightedCodeBlock = ({ node }: { node: Node }) => {
    const language = (node.attrs.language as string | null) ?? "";
    const caption = node.attrs.caption as string | null | undefined;
    return createElement(
      "pre",
      {
        "data-caption": caption ?? undefined,
        "data-wrap": node.attrs.wrap ? "" : undefined,
      },
      createElement(
        "code",
        { className: language ? `language-${language}` : undefined },
        renderHighlightedCode(highlighter, node.textContent, language)
      )
    );
  };
  return HighlightedCodeBlock;
};

export const StaticRenderer = ({
  as: Tag = "div",
  className,
  content,
  extensions,
  staticEditorOptions,
  options,
  sanitize,
  preset = "block",
  highlighter,
  ...props
}: StaticRendererProps) => {
  const rootProps = {
    ...props,
    className: cn("rte-static-renderer editorcn-content", className),
    "data-preset": preset,
  };

  if (typeof content === "string") {
    return createElement(Tag, {
      ...rootProps,
      dangerouslySetInnerHTML: {
        __html: highlighter
          ? highlightCodeBlocksInHtml(
              toSafeHtml(content, sanitize),
              highlighter
            )
          : toSafeHtml(content, sanitize),
      },
    });
  }

  const children = renderToReactElement({
    content,
    extensions: resolveUniqueExtensions(extensions ?? []),
    options:
      highlighter && !options?.nodeMapping?.codeBlock
        ? {
            ...options,
            nodeMapping: {
              ...options?.nodeMapping,
              codeBlock: codeBlockMapping(highlighter),
            },
          }
        : options,
    staticEditorOptions,
  });

  return createElement(Tag, rootProps, children);
};
