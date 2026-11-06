import { readFileSync } from "node:fs";
import { join } from "node:path";

import { generateJSON } from "@tiptap/core";
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

const types = (doc: JSONContent) => doc.content?.map((node) => node.type);

describe("paste cleanup", () => {
  it("cleans Google Docs", () => {
    const html = cleanPastedHtml(fixture("google-docs"), options);
    expect(html).not.toMatch(/style=|docs-internal-guid|dir=/);

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

  it("leaves editor-to-editor pastes alone", () => {
    const html =
      '<p data-pm-slice="1 1 []"><span data-type="mention" data-id="u1">@Ada</span></p>';
    expect(cleanPastedHtml(html, options)).toBe(html);
  });

  it("respects disabled options", () => {
    const html = '<p class="x" style="color:red">a</p><p></p>';
    expect(
      cleanPastedHtml(html, {
        convertWord: false,
        removeEmptyParagraphs: false,
        stripStyles: false,
      })
    ).toBe(html);
  });
});
