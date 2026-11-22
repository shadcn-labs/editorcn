import { mergeAttributes } from "@tiptap/core";
import { Node as _Node, ReactNodeViewRenderer } from "@tiptap/react";

import { NodeView } from "./node-view";
import type { MermaidAttributes, MermaidOptions } from "./types";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaid: (value: MermaidAttributes) => ReturnType;
    };
  }
}

export const Node = _Node.create<MermaidOptions>({
  addAttributes() {
    return {
      value: {
        default: null,
        isRequired: true,
        parseHTML: (element) => element.dataset.value,
        renderHTML: ({ value }) => ({
          "data-value": value,
        }),
      },
    };
  },
  addCommands() {
    return {
      setMermaid:
        (value) =>
        ({ commands }) =>
          commands.insertContent({
            attrs: value,
            type: this.name,
          }),
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(NodeView);
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
      const match = src.match(
        /^ {0,3}(`{3,}|~{3,})[ \t]*mermaid(?:[ \t][^\n]*)?(?:\n|$)/m
      );
      return match ? src.indexOf(match[0]) : -1;
    },
    tokenize: (src: string) => {
      const openMatch = src.match(
        /^ {0,3}(`{3,}|~{3,})[ \t]*mermaid(?:[ \t][^\n]*)?(?:\n|$)/
      );
      if (!openMatch) {
        return;
      }
      const [, fence] = openMatch;
      if (!fence) {
        return;
      }
      const [fenceChar] = fence;
      const fenceLen = fence.length;
      const afterOpen = src.slice(openMatch[0].length);
      const closePattern = new RegExp(
        `^ {0,3}${fenceChar === "`" ? "`" : "~"}{${fenceLen},}[ \\t]*$`,
        "m"
      );
      const closeMatch = afterOpen.match(closePattern);
      let code: string;
      let rawLength: number;
      if (closeMatch && closeMatch.index !== undefined) {
        code = afterOpen.slice(0, closeMatch.index);
        if (code.endsWith("\n")) {
          code = code.slice(0, -1);
        }
        rawLength =
          openMatch[0].length + closeMatch.index + closeMatch[0].length;
        if (src[rawLength] === "\n") {
          rawLength += 1;
        }
      } else {
        code = afterOpen;
        if (code.endsWith("\n")) {
          code = code.slice(0, -1);
        }
        rawLength = src.length;
      }
      return {
        lang: "mermaid",
        raw: src.slice(0, rawLength),
        text: code,
        type: "mermaid",
      };
    },
  },
  name: "mermaid",
  parseHTML() {
    return [
      {
        tag: 'div[data-slot="mermaid"]',
      },
    ];
  },
  parseMarkdown: (token, helpers) => {
    const mermaidToken = token as { lang?: string; text?: string };
    if (mermaidToken.lang && mermaidToken.lang !== "mermaid") {
      return [];
    }
    const value =
      typeof mermaidToken.text === "string" ? mermaidToken.text : "";
    return helpers.createNode("mermaid", {
      value: value.length ? value : null,
    });
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-slot": "mermaid",
      }),
    ];
  },
  renderMarkdown: (node: { attrs?: { value?: string | null } }) => {
    const value = node.attrs?.value ?? "";
    if (!value) {
      return "```mermaid\n```";
    }
    const backtickRuns = value.match(/`+/g) ?? [];
    let maxRun = 0;
    for (const run of backtickRuns) {
      if (run.length > maxRun) {
        maxRun = run.length;
      }
    }
    const fenceLength = Math.max(3, maxRun + 1);
    const fence = "`".repeat(fenceLength);
    return `${fence}mermaid\n${value}\n${fence}`;
  },
});
