import type { Editor } from "@tiptap/react";

import { ALIGNMENTS } from "./constants";

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

export const readState = (e: Editor) => {
  const level = [1, 2, 3].find((l) => e.isActive("heading", { level: l }));
  const text = e.state.doc.textBetween(0, e.state.doc.content.size, " ");
  return {
    align:
      ALIGNMENTS.find((a) => e.isActive({ textAlign: a.value }))?.value ??
      "left",
    canIndent:
      e.can().sinkListItem("listItem") || e.can().sinkListItem("taskItem"),
    canOutdent:
      e.can().liftListItem("listItem") || e.can().liftListItem("taskItem"),
    characters: text.length,
    color: e.getAttributes("textStyle").color as string | undefined,
    font: (e.getAttributes("textStyle").fontFamily as string | undefined) ?? "",
    heading: String(level ?? 0),
    highlight: e.getAttributes("highlight").color as string | undefined,
    taskList: e.isActive("taskList"),
    words: countWords(text),
  };
};

export type EditorSnapshot = ReturnType<typeof readState>;
