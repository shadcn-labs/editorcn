import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { MermaidView } from "./view";

export { MermaidDiagrams } from "./diagrams";
export type { MermaidDiagramsProps } from "./diagrams";
export { MermaidPreview } from "./preview";
export type { MermaidPreviewProps } from "./preview";
export { mermaidSlashCommandItem } from "./slash-command-item";

export interface MermaidAttributes {
  value: string | null;
}

export interface MermaidOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaid: (attributes?: Partial<MermaidAttributes>) => ReturnType;
    };
  }
}

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})[ \t]*mermaid(?:[ \t][^\n]*)?(?:\n|$)/;
const FENCE_OPEN_ANYWHERE = new RegExp(FENCE_OPEN.source, "m");

const longestRun = (value: string, char: string) => {
  let longest = 0;
  for (const run of value.match(new RegExp(`\\${char}+`, "g")) ?? []) {
    longest = Math.max(longest, run.length);
  }
  return longest;
};

export const Mermaid = Node.create<MermaidOptions>({
  addAttributes() {
    return {
      value: {
        default: null,
        parseHTML: (element) => element.textContent || null,
        rendered: false,
      },
    };
  },

  addCommands() {
    return {
      setMermaid:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            attrs: { value: attributes?.value ?? null },
            type: this.name,
          }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView, {
      stopEvent: ({ event }) =>
        event.target instanceof Element &&
        event.target.closest(".ext-mermaid-frame") !== null,
    });
  },

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  atom: true,
  group: "block",

  markdownTokenName: "mermaid",

  markdownTokenizer: {
    level: "block",
    name: "mermaid",
    start: (src: string) => {
      const match = FENCE_OPEN_ANYWHERE.exec(src);
      return match ? match.index : -1;
    },
    tokenize: (src: string) => {
      const open = FENCE_OPEN.exec(src);
      const fence = open?.[1];
      if (!open || !fence) {
        return;
      }
      const afterOpen = src.slice(open[0].length);
      const close = new RegExp(
        `^ {0,3}\\${fence[0]}{${fence.length},}[ \\t]*$`,
        "m"
      ).exec(afterOpen);
      const body = close ? afterOpen.slice(0, close.index) : afterOpen;
      let rawLength = close
        ? open[0].length + close.index + close[0].length
        : src.length;
      if (src[rawLength] === "\n") {
        rawLength += 1;
      }
      return {
        raw: src.slice(0, rawLength),
        text: body.endsWith("\n") ? body.slice(0, -1) : body,
        type: "mermaid",
      };
    },
  },

  name: "mermaid",

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid"]' }];
  },

  parseMarkdown: (token, helpers) =>
    helpers.createNode("mermaid", { value: token.text || null }),

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "mermaid",
      }),
      ["pre", ["code", { class: "language-mermaid" }, node.attrs.value ?? ""]],
    ];
  },

  renderMarkdown: (node) => {
    const value = (node.attrs?.value as string | null) ?? "";
    const fence = "`".repeat(Math.max(3, longestRun(value, "`") + 1));
    return value
      ? `${fence}mermaid\n${value}\n${fence}`
      : `${fence}mermaid\n${fence}`;
  },
});
