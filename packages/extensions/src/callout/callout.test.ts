import { Editor } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Callout, toCalloutVariant } from ".";

const HeadlessCallout = Callout.extend({ addNodeView: () => null });

let editor: Editor | null = null;

const create = (content: string) => {
  editor = new Editor({
    content,
    extensions: [
      StarterKit.configure({ trailingNode: false }),
      HeadlessCallout,
    ],
  });
  return editor;
};

const type = (target: Editor, text: string) => {
  for (const char of text) {
    const { from, to } = target.state.selection;
    const handled = target.view.someProp("handleTextInput", (handler) =>
      handler(target.view, from, to, char, () =>
        target.state.tr.insertText(char, from, to)
      )
    );
    if (!handled) {
      target.view.dispatch(target.state.tr.insertText(char, from, to));
    }
  }
};

describe("callout", () => {
  afterEach(() => {
    editor?.destroy();
    editor = null;
  });

  it("parses and renders data-type callout HTML", () => {
    const html =
      '<div data-type="callout" data-emoji="🔥" data-variant="warning"><p>Hot</p></div>';
    expect(create(html).getHTML()).toBe(html);
  });

  it("falls back to info for unknown variants", () => {
    const target = create(
      '<div data-type="callout" data-variant="bogus"><p>x</p></div>'
    );
    expect(target.getJSON().content?.[0]?.attrs?.variant).toBe("info");
  });

  it("inserts, updates, and unwraps", () => {
    const target = create("<p>One</p><p>Two</p>");
    target.commands.selectAll();
    target.commands.setCallout({ variant: "tip" });
    expect(target.getHTML()).toBe(
      '<div data-type="callout" data-variant="tip"><p>One</p><p>Two</p></div>'
    );

    target.commands.setTextSelection(3);
    target.commands.updateCallout({ emoji: "💡", variant: "danger" });
    expect({ ...target.getJSON().content?.[0]?.attrs }).toStrictEqual({
      emoji: "💡",
      variant: "danger",
    });

    target.commands.unsetCallout();
    expect(target.getHTML()).toBe("<p>One</p><p>Two</p>");
  });

  it("toggles a callout on and off", () => {
    const target = create("<p>Text</p>");
    target.commands.setTextSelection(2);
    target.commands.toggleCallout({ variant: "note" });
    expect(target.isActive("callout", { variant: "note" })).toBeTruthy();
    target.commands.toggleCallout();
    expect(target.getHTML()).toBe("<p>Text</p>");
  });

  it("exits on Enter in an empty last line", () => {
    const target = create(
      '<div data-type="callout" data-variant="info"><p>Text</p><p></p></div>'
    );
    target.commands.focus("end");
    target.commands.keyboardShortcut("Enter");
    expect(target.getHTML()).toBe(
      '<div data-type="callout" data-variant="info"><p>Text</p></div><p></p>'
    );
    expect(target.isActive("callout")).toBeFalsy();
  });

  it("does not split the callout on Enter in an empty middle line", () => {
    const target = create(
      '<div data-type="callout" data-variant="info"><p>A</p><p></p><p>B</p></div>'
    );
    target.commands.setTextSelection(5);
    target.commands.keyboardShortcut("Enter");
    expect(target.getHTML()).toBe(
      '<div data-type="callout" data-variant="info"><p>A</p><p></p><p></p><p>B</p></div>'
    );
  });

  it("turns > [!WARNING] into a callout", () => {
    const target = create("<p></p>");
    target.commands.focus("end");
    type(target, "> [!WARNING] ");
    expect(target.getHTML()).toBe(
      '<div data-type="callout" data-variant="warning"><p></p></div>'
    );
  });

  it("turns [!TIP] in a paragraph into a callout", () => {
    const target = create("<p></p>");
    target.commands.focus("end");
    type(target, "[!tip] ");
    expect(target.getHTML()).toBe(
      '<div data-type="callout" data-variant="tip"><p></p></div>'
    );
  });

  it("ignores inherited object keys as alert types", () => {
    const target = create("<p></p>");
    target.commands.focus("end");
    type(target, "[!constructor] ");
    expect(target.getHTML()).toBe("<p>[!constructor] </p>");
    expect(toCalloutVariant("constructor")).toBe("info");
    expect(toCalloutVariant("__proto__")).toBe("info");
  });

  it("updates and removes a callout selected as a node", () => {
    const target = create(
      '<div data-type="callout" data-variant="info"><p>x</p></div>'
    );
    target.commands.setNodeSelection(0);
    target.commands.updateCallout({ variant: "tip" });
    expect(target.getJSON().content?.[0]?.attrs?.variant).toBe("tip");
    target.commands.unsetCallout();
    expect(target.getHTML()).toBe("<p>x</p>");
  });

  it("toggles off inside a chain that moves the selection", () => {
    const target = create(
      '<p>a</p><div data-type="callout" data-variant="info"><p>b</p></div>'
    );
    target.commands.setTextSelection(1);
    target.chain().setTextSelection(5).toggleCallout().run();
    expect(target.getHTML()).toBe("<p>a</p><p>b</p>");
  });

  it("ignores unknown alert types", () => {
    const target = create("<p></p>");
    target.commands.focus("end");
    type(target, "[!FOO] ");
    expect(target.getHTML()).toBe("<p>[!FOO] </p>");
  });

  it("keeps data-type when HTMLAttributes sets one", () => {
    const target = new Editor({
      content: '<div data-type="callout"><p>a</p></div>',
      extensions: [
        StarterKit.configure({ trailingNode: false }),
        HeadlessCallout.configure({ HTMLAttributes: { "data-type": "x" } }),
      ],
    });
    expect(target.getHTML()).toContain('data-type="callout"');
    target.destroy();
  });

  it("rejects unsupported variants", () => {
    const target = create(
      '<div data-type="callout" data-variant="tip"><p>a</p></div><p>b</p>'
    );
    target.commands.setTextSelection(2);
    const bogus = { variant: "bogus" as never };
    expect(target.commands.updateCallout(bogus)).toBeFalsy();
    target.commands.setTextSelection(6);
    expect(target.commands.setCallout(bogus)).toBeFalsy();
    expect(target.getHTML()).toBe(
      '<div data-type="callout" data-variant="tip"><p>a</p></div><p>b</p>'
    );
  });
});

describe("callout markdown", () => {
  const manager = new MarkdownManager({
    extensions: [StarterKit, HeadlessCallout],
  });

  it("round-trips GitHub alerts for every variant", () => {
    for (const alert of ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"]) {
      const md = `> [!${alert}]\n> Some **bold** text\n>\n> - a\n> - b`;
      expect(manager.serialize(manager.parse(md)).trim()).toBe(md);
    }
  });

  it("maps alerts to variants", () => {
    const json = manager.parse("> [!CAUTION]\n> Careful");
    expect(json.content?.[0]).toMatchObject({
      attrs: { variant: "danger" },
      type: "callout",
    });
  });

  it("leaves plain blockquotes alone", () => {
    const json = manager.parse("> just a quote");
    expect(json.content?.[0]?.type).toBe("blockquote");
  });

  it("skips unknown alerts and still finds later ones", () => {
    const json = manager.parse("> [!FOO]\n> x\n\n> [!TIP]\n> y");
    expect(json.content?.map((node) => node.type)).toStrictEqual([
      "blockquote",
      "callout",
    ]);
  });

  it("keeps surrounding content", () => {
    const md = "Before\n\n> [!NOTE]\n> Inside\n\nAfter";
    expect(manager.serialize(manager.parse(md)).trim()).toBe(md);
  });
});
