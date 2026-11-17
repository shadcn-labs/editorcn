import { Editor, Extension } from "@tiptap/core";
import type { AnyExtension, JSONContent } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Toggle } from ".";
import { toggleSlashCommandItem } from "./slash-command-item";

let editor: Editor | null = null;

const create = (content: string, ...extra: AnyExtension[]) => {
  editor = new Editor({
    content,
    extensions: [
      StarterKit.configure({ trailingNode: false }),
      Toggle,
      ...extra,
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

// `commands.keyboardShortcut` drops selection changes; use a real keydown.
const pressKey = (target: Editor, key: string) => {
  target.view.dom.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key })
  );
};

const Blocker = Extension.create({
  // Rejects the Enter transaction (which carries a `setNodeMarkup` step) while
  // letting selection-only setup commands through.
  addProseMirrorPlugins() {
    return [new Plugin({ filterTransaction: (tr) => tr.steps.length === 0 })];
  },
  name: "blocker",
});

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

  it("keeps +++ when typing inside an empty summary", () => {
    const target = create(
      '<details><summary></summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setTextSelection(2);
    type(target, "+++");
    expect(target.getHTML()).toContain("<summary>+++</summary>");
    expect(target.getHTML().split("<details").length - 1).toBe(1);
  });

  it("slash command inserts a toggle and removes the query", () => {
    const target = create("<p>/toggle</p>");
    toggleSlashCommandItem.command({
      editor: target,
      range: { from: 1, to: 8 },
    });
    expect(target.getHTML()).toBe(
      '<details><summary></summary><div data-type="detailsContent"><p></p></div></details>'
    );
  });

  it("slash command leaves the document alone when a toggle cannot be inserted", () => {
    const html =
      '<details><summary>/toggle</summary><div data-type="detailsContent"><p>Body</p></div></details>';
    const target = create(html);
    target.commands.setTextSelection(9);
    toggleSlashCommandItem.command({
      editor: target,
      range: { from: 2, to: 9 },
    });
    expect(target.getHTML()).toBe(html);
  });

  it("updates the button label when Enter opens the toggle", () => {
    const target = create(
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>'
    );
    target.commands.setTextSelection(3);
    pressKey(target, "Enter");
    const button = (target.view.nodeDOM(0) as HTMLElement).querySelector(
      ".ext-toggle-button"
    );
    expect(button?.getAttribute("aria-label")).toBe("Collapse section");
  });

  it("restores the DOM when the Enter transaction is rejected", () => {
    const target = create(
      '<details><summary>Title</summary><div data-type="detailsContent"><p>Body</p></div></details>',
      Blocker
    );
    target.commands.setTextSelection(3);
    pressKey(target, "Enter");
    expect(target.state.selection.from).toBe(3);
    expect(target.getJSON().content?.[0]?.attrs?.open ?? false).toBeFalsy();
    const detailsDom = target.view.nodeDOM(0) as HTMLElement;
    expect(detailsDom.classList.contains("is-open")).toBeFalsy();
    expect(
      detailsDom
        .querySelector('div[data-type="detailsContent"]')
        ?.hasAttribute("hidden")
    ).toBeTruthy();
    expect(
      detailsDom.querySelector(".ext-toggle-button")?.getAttribute("aria-label")
    ).toBe("Expand section");
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
