import { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Toggle } from ".";

let editor: Editor | null = null;

const create = (content: string) => {
  editor = new Editor({
    content,
    extensions: [StarterKit.configure({ trailingNode: false }), Toggle],
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

// `commands.keyboardShortcut` captures transactions and drops selection
// changes, so key presses that move the selection go through the real DOM
// handler instead.
const pressKey = (target: Editor, key: string) => {
  target.view.dom.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key })
  );
};

describe("toggle", () => {
  afterEach(() => {
    editor?.destroy();
    editor = null;
  });

  it("parses and renders native details HTML", () => {
    const html =
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>';
    expect(create(html).getHTML()).toBe(html);
  });

  it("keeps the open state in HTML and JSON", () => {
    const html =
      '<details open><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>';
    const target = create(html);
    expect(target.getJSON().content?.[0]?.attrs?.open).toBeTruthy();
    expect(target.getHTML()).toBe(html.replaceAll(" open>", ' open="">'));
  });

  it("wraps selected blocks with setDetails", () => {
    const target = create("<p>One</p><p>Two</p>");
    target.commands.selectAll();
    target.commands.setDetails();
    expect(target.getHTML()).toBe(
      '<details><summary></summary><div data-type="detailsContent"><p>One</p><p>Two</p></div></details>'
    );
    expect(target.state.selection.from).toBe(2);
  });

  it("unwraps with unsetDetails and keeps the content", () => {
    const target = create(
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setTextSelection(3);
    target.commands.unsetDetails();
    expect(target.getHTML()).toBe("<p>Title</p><p>Body</p>");
  });

  it("unwraps when the summary is selected as a node", () => {
    const target = create(
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setNodeSelection(1);
    target.commands.unsetDetails();
    expect(target.getHTML()).toBe("<p>Title</p><p>Body</p>");
  });

  it("creates a toggle from +++ on an empty line", () => {
    const target = create("<p></p>");
    target.commands.focus("end");
    type(target, "+++");
    expect(target.getHTML()).toBe(
      '<details><summary></summary><div data-type="detailsContent"><p></p></div></details>'
    );
    expect(target.state.selection.from).toBe(2);
  });

  it("does not trigger +++ when the line has text", () => {
    const target = create("<p>a</p>");
    target.commands.focus("end");
    type(target, "+++");
    expect(target.getHTML()).toBe("<p>a+++</p>");
  });

  it("opens the toggle and moves into the content on Enter in the summary", () => {
    const target = create(
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setTextSelection(3);
    pressKey(target, "Enter");
    expect(target.getJSON().content?.[0]?.attrs?.open).toBeTruthy();
    expect(target.state.selection.from).toBe(10);
  });

  it("moves into the content on Enter when the toggle is already open", () => {
    const target = create(
      '<details open><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setTextSelection(3);
    pressKey(target, "Enter");
    expect(target.state.selection.from).toBe(10);
    expect(target.getHTML()).toBe(
      '<details open=""><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
  });

  it("unwraps on Backspace at the start of the summary", () => {
    const target = create(
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setTextSelection(2);
    target.commands.keyboardShortcut("Backspace");
    expect(target.getHTML()).toBe("<p>Title</p><p>Body</p>");
  });

  it("keeps the open state when the content is nested inside another block", () => {
    const target = create(
      '<details><summary>Outer</summary><div data-type="detailsContent"><p>A</p></div></details>'
    );
    target.commands.setTextSelection(10);
    target.commands.setDetails();
    expect(target.getHTML()).toBe(
      '<details><summary>Outer</summary><div data-type="detailsContent"><details><summary></summary><div data-type="detailsContent"><p>A</p></div></details></div></details>'
    );
    target.commands.keyboardShortcut("Enter");
    const json = target.getJSON() as JSONContent;
    expect(
      json.content?.[0]?.content?.[1]?.content?.[0]?.attrs?.open
    ).toBeTruthy();
  });
});
