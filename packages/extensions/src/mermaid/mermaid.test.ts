import { Editor } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Mermaid } from ".";

const HeadlessMermaid = Mermaid.Node.extend({ addNodeView: () => null });

let editor: Editor | null = null;

const create = (content: string) => {
  editor = new Editor({
    content,
    extensions: [
      StarterKit.configure({ trailingNode: false }),
      HeadlessMermaid,
    ],
  });
  return editor;
};

describe("mermaid", () => {
  afterEach(() => {
    editor?.destroy();
    editor = null;
  });

  it("parses and renders a mermaid node from HTML", () => {
    const html = '<div data-slot="mermaid" data-value="graph TD"></div>';
    const target = create(html);
    expect(target.getJSON().content?.[0]).toMatchObject({
      attrs: { value: "graph TD" },
      type: "mermaid",
    });
  });
});

describe("mermaid markdown", () => {
  const manager = new MarkdownManager({
    extensions: [StarterKit, HeadlessMermaid],
  });

  it("round-trips a fenced mermaid block", () => {
    const md = "```mermaid\ngraph TD\n  A-->B\n```";
    expect(manager.serialize(manager.parse(md)).trim()).toBe(md);
  });

  it("parses a fenced mermaid block into a mermaid node", () => {
    const json = manager.parse("```mermaid\ngraph TD\n  A-->B\n```");
    expect(json.content?.[0]).toMatchObject({
      attrs: { value: "graph TD\n  A-->B" },
      type: "mermaid",
    });
  });

  it("renders an empty diagram as an empty fence", () => {
    const md = "```mermaid\n```";
    const node = manager.parse(md);
    expect(manager.serialize(node).trim()).toBe(md);
  });
});
