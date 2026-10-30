import { TaskItem, TaskList } from "@tiptap/extension-list";
import { MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";

import { looksLikeMarkdown } from ".";
import { TwitterEmbed } from "../../../editor/src/controls/rte-twitter-control";
import { YouTubeEmbed } from "../../../editor/src/controls/rte-youtube-control";
import { ResizableImage } from "../image-placeholder";
import { Mention } from "../mention";
import { Table } from "../table";

const manager = new MarkdownManager({
  extensions: [
    StarterKit,
    TaskList,
    TaskItem,
    Mention,
    Table,
    ResizableImage,
    TwitterEmbed,
    YouTubeEmbed,
  ],
});

const roundTrip = (md: string) => manager.serialize(manager.parse(md)).trim();

describe("markdown", () => {
  it("keeps default nodes and marks", () => {
    const md = [
      "# Title",
      "Some **bold**, *italic*, ~~strike~~, `code`, and a [link](https://x.com).",
      "> quote",
      "- a\n- b\n  - nested",
      "1. one\n2. two",
      "```ts\nconst a = 1;\n```",
      "![alt](https://x.com/a.png)",
      "---",
    ].join("\n\n");
    expect(roundTrip(md)).toBe(md);
  });

  it("keeps GFM tables", () => {
    const json = manager.parse("| A | B |\n| --- | --- |\n| 1 | 2 |");
    expect(manager.parse(manager.serialize(json))).toStrictEqual(json);
    expect(json.content?.[0]?.type).toBe("table");
  });

  it("keeps GFM task lists", () => {
    const md = "- [ ] todo\n- [x] done";
    expect(manager.parse(md).content?.[0]?.type).toBe("taskList");
    expect(roundTrip(md)).toBe(md);
  });

  it("keeps mentions with id and label", () => {
    const md = 'Hi [mention id="u1" label="Ada"]!';
    const json = manager.parse(md);
    expect(json.content?.[0]?.content?.[1]).toMatchObject({
      attrs: { id: "u1", label: "Ada" },
      type: "mention",
    });
    expect(roundTrip(md)).toBe(md);
  });

  it("keeps YouTube and Twitter embeds", () => {
    const youtube = { attrs: { src: "https://youtu.be/abc" }, type: "youtube" };
    const twitter = { attrs: { tweetId: "123" }, type: "twitter" };
    const json = { content: [youtube, twitter], type: "doc" };
    const parsed = manager.parse(manager.serialize(json));
    expect(parsed.content?.[0]).toMatchObject(youtube);
    expect(parsed.content?.[1]).toMatchObject(twitter);
  });

  it("detects markdown in pasted text", () => {
    expect(looksLikeMarkdown("# Heading")).toBeTruthy();
    expect(looksLikeMarkdown("- item")).toBeTruthy();
    expect(looksLikeMarkdown("see **this**")).toBeTruthy();
    expect(looksLikeMarkdown("[docs](https://x.com)")).toBeTruthy();
    expect(looksLikeMarkdown("just a normal sentence.")).toBeFalsy();
    expect(looksLikeMarkdown("snake_case_name")).toBeFalsy();
  });
});
