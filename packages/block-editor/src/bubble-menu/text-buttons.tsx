import type { Editor } from "@tiptap/react";

import { DEFAULT_ICONS } from "../icons";
import { BubbleButton, BubbleButtonGroup } from "../ui";
import { useEditorState, shallowEqual } from "./utils";

interface TextSelectorResult {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isCode: boolean;
}

interface ToggleableChain {
  run(): boolean;
  toggleBold(): ToggleableChain;
  toggleCode(): ToggleableChain;
  toggleItalic(): ToggleableChain;
  toggleStrike(): ToggleableChain;
  toggleUnderline(): ToggleableChain;
}

const textItems = [
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleBold().run(),
    icon: DEFAULT_ICONS.boldIcon,
    isActive: (s: TextSelectorResult) => s.isBold,
    mark: "bold",
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleItalic().run(),
    icon: DEFAULT_ICONS.italicIcon,
    isActive: (s: TextSelectorResult) => s.isItalic,
    mark: "italic",
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleUnderline().run(),
    icon: DEFAULT_ICONS.underlineIcon,
    isActive: (s: TextSelectorResult) => s.isUnderline,
    mark: "underline",
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleStrike().run(),
    icon: DEFAULT_ICONS.strikethroughIcon,
    isActive: (s: TextSelectorResult) => s.isStrike,
    mark: "strike",
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleCode().run(),
    icon: DEFAULT_ICONS.codeIcon,
    isActive: (s: TextSelectorResult) => s.isCode,
    mark: "code",
  },
];

export const getTextItems = (editor: Editor) =>
  textItems.filter((item) => Boolean(editor.schema.marks[item.mark]));

export const TextButtons = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState(
    editor,
    (ed) => ({
      isBold: ed.isActive("bold"),
      isCode: ed.isActive("code"),
      isItalic: ed.isActive("italic"),
      isStrike: ed.isActive("strike"),
      isUnderline: ed.isActive("underline"),
    }),
    shallowEqual
  );

  return (
    <BubbleButtonGroup>
      {getTextItems(editor).map((item) => (
        <BubbleButton
          key={item.mark}
          active={item.isActive(editorState)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => item.command(editor)}
        >
          {item.icon}
        </BubbleButton>
      ))}
    </BubbleButtonGroup>
  );
};
