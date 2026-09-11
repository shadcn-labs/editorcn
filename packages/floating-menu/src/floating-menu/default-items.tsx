"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";

import type { FloatingMenuItem } from "./floating-menu";

interface FloatingMenuChainedCommands {
  focus: () => FloatingMenuChainedCommands;
  run: () => boolean;
  toggleBold: () => FloatingMenuChainedCommands;
  toggleCode: () => FloatingMenuChainedCommands;
  toggleItalic: () => FloatingMenuChainedCommands;
  toggleStrike: () => FloatingMenuChainedCommands;
  toggleUnderline: () => FloatingMenuChainedCommands;
}

const chainFocus = (editor: Editor): FloatingMenuChainedCommands =>
  editor.chain().focus() as unknown as FloatingMenuChainedCommands;

const iconClassName = "fm-icon";

/**
 * Default text-formatting actions for selected text. Pair with a
 * `shouldShow` predicate that requires a non-empty selection (see
 * `showOnTextSelection`). `toggleUnderline` needs
 * `@tiptap/extension-underline`, which is not part of StarterKit; it
 * no-ops gracefully without it.
 */
export const defaultTextFormattingItems: FloatingMenuItem[] = [
  {
    command: (editor) => {
      chainFocus(editor).toggleBold().run();
    },
    icon: <Bold className={iconClassName} />,
    id: "bold",
    isActive: (editor) => editor.isActive("bold"),
    label: "Bold",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleItalic().run();
    },
    icon: <Italic className={iconClassName} />,
    id: "italic",
    isActive: (editor) => editor.isActive("italic"),
    label: "Italic",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleUnderline().run();
    },
    icon: <UnderlineIcon className={iconClassName} />,
    id: "underline",
    isActive: (editor) => editor.isActive("underline"),
    label: "Underline",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleStrike().run();
    },
    icon: <Strikethrough className={iconClassName} />,
    id: "strikethrough",
    isActive: (editor) => editor.isActive("strike"),
    label: "Strikethrough",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleCode().run();
    },
    icon: <Code className={iconClassName} />,
    id: "code",
    isActive: (editor) => editor.isActive("code"),
    label: "Inline code",
  },
];
