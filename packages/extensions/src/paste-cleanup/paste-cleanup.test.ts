import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Editor, generateJSON } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";

import { cleanPastedHtml, PasteCleanup } from ".";
import { ResizableImage } from "../image-placeholder";

const { options } = PasteCleanup;

const fixture = (name: string) =>
  readFileSync(join(import.meta.dirname, "fixtures", `${name}.html`), "utf-8");

const paste = (html: string) =>
  generateJSON(cleanPastedHtml(html, options), [StarterKit, ResizableImage]);

const texts = (node: JSONContent): string[] =>
  node.text === undefined
    ? (node.content ?? []).flatMap(texts)
    : [`${node.text}${node.marks?.map((m) => `:${m.type}`).join("") ?? ""}`];

const wordItem = (level: number, marker: string, text: string) =>
  `<p style="mso-list:l0 level${level} lfo1"><span style="mso-list: Ignore">${marker}</span>${text}</p>`;

const types = (doc: JSONContent) => doc.content?.map((node) => node.type);

describe("paste cleanup", () => {
  it("cleans Google Docs", () => {
    const html = cleanPastedHtml(fixture("google-docs"), options);
    expect(html).not.toMatch(
      /style="(?!white-space: pre)|docs-internal-guid|dir=/
    );

    const doc = paste(fixture("google-docs"));
    expect(types(doc)).toStrictEqual([
      "heading",
      "paragraph",
      "bulletList",
      "paragraph",
    ]);
    expect(texts(doc)).toStrictEqual([
      "Project brief",
      "Plain, ",
      "bold:bold",
      ", ",
      "italic:italic",
      " and ",
      "underlined:underline",
      " text.",
      "First",
      "Nested",
      "Second",
      "A link:link",
    ]);
    expect(doc.content?.[2]?.content?.[0]?.content?.[1]?.type).toBe(
      "bulletList"
    );
  });

  it("turns Word mso-list paragraphs into nested lists", () => {
    const doc = paste(fixture("word"));
    expect(types(doc)).toStrictEqual([
      "paragraph",
      "paragraph",
      "bulletList",
      "orderedList",
    ]);
    expect(texts(doc)).toStrictEqual([
      "Meeting notes:bold",
      "Some ",
      "italic:italic",
      " text in a weird font.",
      "Bullet one",
      "Bullet nested",
      "Bullet two",
      "Step one",
      "Step two",
    ]);
    const [first, second] = doc.content?.[2]?.content ?? [];
    expect(first?.content?.[1]?.type).toBe("bulletList");
    expect(second?.content).toHaveLength(1);
  });

  it("cleans Notion", () => {
    const html = cleanPastedHtml(fixture("notion"), options);
    expect(html).not.toMatch(/ id=| class=/);

    const doc = paste(fixture("notion"));
    expect(types(doc)).toStrictEqual([
      "heading",
      "paragraph",
      "bulletList",
      "bulletList",
      "blockquote",
    ]);
    expect(texts(doc)).toContain("paste cleanup:bold");
    expect(texts(doc)).toContain("transformPastedHTML:code");
  });

  it("cleans a web page", () => {
    const html = cleanPastedHtml(fixture("web-page"), options);
    expect(html).not.toMatch(/class=|target=|srcset|color|font-size|<p><br>/);

    const doc = paste(fixture("web-page"));
    expect(types(doc)).toStrictEqual([
      "heading",
      "paragraph",
      "image",
      "paragraph",
    ]);
    expect(texts(doc).slice(0, 4)).toStrictEqual([
      "Release notes",
      "Faster:bold",
      " builds and ",
      "a changelog:link",
    ]);
    expect(doc.content?.[2]?.attrs).toMatchObject({
      alt: "Chart",
      src: "https://example.com/chart.png",
    });
  });

  it("keeps resets nested inside formatted text", () => {
    const doc = paste(
      '<p><span style="font-weight:700">bold <span style="font-weight:normal">plain</span> bold</span></p>'
    );
    expect(texts(doc)).toStrictEqual(["bold :bold", "plain", " bold:bold"]);
  });

  it("keeps Word numbering, tolerates spaced markers, and caps depth", () => {
    const html = cleanPastedHtml(
      wordItem(1, "3.", "Third") + wordItem(999_999, "4.", "Deep"),
      options
    );
    expect(html).toContain('<ol start="3">');
    expect(html).not.toMatch(/3\.|4\./);
    expect(html.match(/<[ou]l/g)).toHaveLength(9);
  });

  it("keeps task lists and pre-wrap whitespace", () => {
    const html = cleanPastedHtml(
      '<ul data-type="taskList" class="x"><li data-type="taskItem" data-checked="true" data-id="1"><p>Done</p></li></ul><p data-type="x"><span style="white-space:pre-wrap;color:red">a   b</span></p>',
      options
    );
    expect(html).toBe(
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Done</p></li></ul><p><span style="white-space: pre-wrap">a   b</span></p>'
    );
  });

  it("only skips cleanup for real editor slices", () => {
    expect(
      cleanPastedHtml('<p class="x">Use data-pm-slice here</p>', options)
    ).toBe("<p>Use data-pm-slice here</p>");
  });

  it("cleans pastes through the editor plugin", () => {
    const html = "<p>Hi</p><p></p>";
    const pasteInto = (extension: typeof PasteCleanup) => {
      const editor = new Editor({ extensions: [StarterKit, extension] });
      editor.view.pasteHTML(html);
      const result = editor.getHTML();
      editor.destroy();
      return result;
    };
    expect(pasteInto(PasteCleanup)).toBe("<p>Hi</p>");
    expect(
      pasteInto(
        PasteCleanup.configure({
          convertWord: false,
          removeEmptyParagraphs: false,
          stripStyles: false,
        })
      )
    ).toBe("<p>Hi</p><p></p>");
  });

  it("leaves editor-to-editor pastes alone", () => {
    const html =
      '<p data-pm-slice="1 1 []"><span data-type="mention" data-id="u1">@Ada</span></p>';
    expect(cleanPastedHtml(html, options)).toBe(html);
  });

  it("respects disabled options", () => {
    const html =
      '<p class="x" style="color:red">a</p><p></p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>b</p>';
    expect(
      cleanPastedHtml(html, {
        convertWord: false,
        removeEmptyParagraphs: false,
        stripStyles: false,
      })
    ).toBe(html);
  });
});
