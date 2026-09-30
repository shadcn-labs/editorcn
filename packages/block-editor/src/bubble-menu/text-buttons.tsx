import {
  BubbleButton,
  BubbleButtonGroup,
} from "@editorcn/editor-ui/block-editor/ui";
import type { Editor } from "@tiptap/react";

import { DEFAULT_ICONS } from "../icons";
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
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleItalic().run(),
    icon: DEFAULT_ICONS.italicIcon,
    isActive: (s: TextSelectorResult) => s.isItalic,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleUnderline().run(),
    icon: DEFAULT_ICONS.underlineIcon,
    isActive: (s: TextSelectorResult) => s.isUnderline,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleStrike().run(),
    icon: DEFAULT_ICONS.strikethroughIcon,
    isActive: (s: TextSelectorResult) => s.isStrike,
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as ToggleableChain).toggleCode().run(),
    icon: DEFAULT_ICONS.codeIcon,
    isActive: (s: TextSelectorResult) => s.isCode,
  },
];

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
      {textItems.map((item, i) => (
        <BubbleButton
          key={i}
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
