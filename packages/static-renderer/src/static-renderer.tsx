import type { Extensions, JSONContent } from "@tiptap/core";
import type { Mark, Node } from "@tiptap/pm/model";
import { renderToReactElement } from "@tiptap/static-renderer";
import type {
  StaticEditorOptions,
  TiptapStaticRendererOptions,
} from "@tiptap/static-renderer";
import { createElement } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "./lib/utils";

const resolveUniqueExtensions = (extensions: Extensions) => {
  const byName = new Map<string, (typeof extensions)[number]>();
  for (const extension of extensions) {
    byName.set(extension.name, extension);
  }
  return [...byName.values()];
};

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
};

export const StaticRenderer = ({
  as: Tag = "div",
  className,
  content,
  extensions,
  staticEditorOptions,
  options,
  ...props
}: StaticRendererProps) => {
  if (typeof content === "string") {
    return createElement(Tag, {
      ...props,
      className: cn("rte-static-renderer", className),
      dangerouslySetInnerHTML: { __html: content },
    });
  }

  const children = renderToReactElement({
    content,
    extensions: resolveUniqueExtensions(extensions ?? []),
    options,
    staticEditorOptions,
  });

  return createElement(
    Tag,
    { ...props, className: cn("rte-static-renderer", className) },
    children
  );
};
