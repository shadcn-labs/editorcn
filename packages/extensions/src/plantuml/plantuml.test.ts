import { Editor } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { PlantUML } from ".";

const HeadlessPlantUML = PlantUML.Node.extend({ addNodeView: () => null });

let editor: Editor | null = null;

const create = (content: string) => {
  editor = new Editor({
    content,
    extensions: [
      StarterKit.configure({ trailingNode: false }),
      HeadlessPlantUML,
    ],
  });
  return editor;
};

describe("plantuml", () => {
  afterEach(() => {
    editor?.destroy();
    editor = null;
  });

  it("parses and renders a plantuml node from HTML", () => {
    const html =
      '<div data-slot="plantuml" data-value="@startuml\nA->B\n@enduml"></div>';
    const target = create(html);
    expect(target.getJSON().content?.[0]).toMatchObject({
      attrs: { value: "@startuml\nA->B\n@enduml" },
      type: "plantuml",
    });
  });
});

describe("plantuml markdown", () => {
  const manager = new MarkdownManager({
    extensions: [StarterKit, HeadlessPlantUML],
  });

  it("round-trips a fenced plantuml block", () => {
    const md = "```plantuml\n@startuml\nA->B\n@enduml\n```";
    expect(manager.serialize(manager.parse(md)).trim()).toBe(md);
  });

  it("parses a fenced plantuml block into a plantuml node", () => {
    const json = manager.parse("```plantuml\n@startuml\nA->B\n@enduml\n```");
    expect(json.content?.[0]).toMatchObject({
      attrs: { value: "@startuml\nA->B\n@enduml" },
      type: "plantuml",
    });
  });
});
