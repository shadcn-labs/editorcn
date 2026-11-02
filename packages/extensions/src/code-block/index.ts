import CodeBlockBase from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { createHighlightPlugin } from "./highlight";
import { CodeBlockView } from "./view";

export { CODE_BLOCK_LANGUAGES } from "./languages";

export const CodeBlock = CodeBlockBase.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element) => element.dataset.caption ?? null,
        renderHTML: (attributes) =>
          attributes.caption === null
            ? {}
            : { "data-caption": attributes.caption },
      },
      wrap: {
        default: false,
        parseHTML: (element) => "wrap" in element.dataset,
        renderHTML: (attributes) =>
          attributes.wrap ? { "data-wrap": "" } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), createHighlightPlugin(this.name)];
  },
}).configure({ defaultLanguage: "javascript" });
