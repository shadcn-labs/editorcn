import { Editor } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Mermaid } from ".";
import { CodeBlock } from "../code-block";
import { mermaidSlashCommandItem } from "./slash-command-item";

const HeadlessMermaid = Mermaid.extend({ addNodeView: () => null });

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

  it("parses the source from HTML", () => {
    const target = create(
      '<div data-type="mermaid"><pre><code>graph TD\n  A--&gt;B</code></pre></div>'
    );
    expect(target.getJSON().content?.[0]).toMatchObject({
      attrs: { value: "graph TD\n  A-->B" },
      type: "mermaid",
    });
  });

  it("renders the source as a code fallback in HTML", () => {
    const target = create("<p></p>");
    target.commands.setMermaid({ value: "graph TD\n  A-->B" });
    expect(target.getHTML()).toContain(
      '<div data-type="mermaid"><pre><code class="language-mermaid">graph TD\n  A--&gt;B</code></pre></div>'
    );
  });

  it("inserts an empty diagram", () => {
    const target = create("<p></p>");
    target.commands.setMermaid();
    expect(target.getJSON().content).toContainEqual({
      attrs: { value: null },
      type: "mermaid",
    });
  });

  it("inserts a diagram from the slash command", () => {
    const target = create("<p>/diagram</p>");
    mermaidSlashCommandItem.command({
      editor: target,
      range: { from: 1, to: 9 },
    });
    expect(target.getJSON().content?.[0]).toMatchObject({ type: "mermaid" });
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

  it("round-trips an empty diagram", () => {
    const md = "```mermaid\n```";
    expect(manager.serialize(manager.parse(md)).trim()).toBe(md);
  });

  it("leaves other fences as code blocks", () => {
    const json = manager.parse("```mermaid-example\ngraph TD\n```");
    expect(json.content?.[0]).toMatchObject({ type: "codeBlock" });
  });

  it("round-trips source containing an embedded fence", () => {
    const value = "flowchart TD\n```\nA-->B";
    const node = manager.parse(`\`\`\`\`mermaid\n${value}\n\`\`\`\``);
    expect(node.content?.[0]).toMatchObject({
      attrs: { value },
      type: "mermaid",
    });
    expect(manager.parse(manager.serialize(node))).toStrictEqual(node);
  });

  it("takes mermaid fences ahead of the code block extension", () => {
    const withCodeBlock = new MarkdownManager({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlock,
        HeadlessMermaid,
      ],
    });
    const json = withCodeBlock.parse(
      "```mermaid\ngraph TD\n```\n\n```ts\nx\n```"
    );
    expect(json.content?.map((node) => node.type)).toStrictEqual([
      "mermaid",
      "codeBlock",
    ]);
  });
});
