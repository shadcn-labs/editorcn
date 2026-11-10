import { MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";

import { Toggle } from ".";

const fence = (open: boolean) =>
  `:::details${open ? " {open}" : ""}\n\n:::detailsSummary\n\nTitle\n\n:::\n\n:::detailsContent\n\nBody\n\n:::\n\n:::`;

describe("toggle markdown", () => {
  const manager = new MarkdownManager({
    extensions: [StarterKit, Toggle],
  });

  it.each([true, false])("round-trips with open: %s", (open) => {
    const md = fence(open);
    const json = manager.parse(md);
    expect(json.content?.[0]?.type).toBe("details");
    expect(json.content?.[0]?.attrs?.open ?? false).toBe(open);
    expect(manager.serialize(json).trim()).toBe(md);
  });

  it("keeps surrounding content", () => {
    const md = `Before\n\n${fence(true)}\n\nAfter`;
    expect(manager.serialize(manager.parse(md)).trim()).toBe(md);
  });
});
