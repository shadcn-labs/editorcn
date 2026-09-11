"use client";

import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  SquareCode,
  TextQuote,
} from "lucide-react";

import type { FloatingMenuItem } from "./floating-menu";

interface FloatingMenuChainedCommands {
  focus: () => FloatingMenuChainedCommands;
  run: () => boolean;
  setHorizontalRule: () => FloatingMenuChainedCommands;
  setParagraph: () => FloatingMenuChainedCommands;
  toggleBlockquote: () => FloatingMenuChainedCommands;
  toggleBulletList: () => FloatingMenuChainedCommands;
  toggleCodeBlock: () => FloatingMenuChainedCommands;
  toggleHeading: (attributes: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  }) => FloatingMenuChainedCommands;
  toggleOrderedList: () => FloatingMenuChainedCommands;
}

const chainFocus = (editor: Editor): FloatingMenuChainedCommands =>
  editor.chain().focus() as unknown as FloatingMenuChainedCommands;

const iconClassName = "fm-icon";

/**
 * Default cursor actions for the floating menu: insert / transform blocks
 * at the caret. Unlike the bubble menu (which formats selected text),
 * these operate on the block containing the cursor, so no selection is
 * needed. Commands no-op gracefully when the editor lacks the node type.
 */
export const defaultFloatingMenuItems: FloatingMenuItem[] = [
  {
    command: (editor) => {
      chainFocus(editor).setParagraph().run();
    },
    icon: <Pilcrow className={iconClassName} />,
    id: "text",
    isActive: (editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList"),
    label: "Text",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleHeading({ level: 1 }).run();
    },
    icon: <Heading1 className={iconClassName} />,
    id: "heading-1",
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    label: "Heading 1",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleHeading({ level: 2 }).run();
    },
    icon: <Heading2 className={iconClassName} />,
    id: "heading-2",
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    label: "Heading 2",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleHeading({ level: 3 }).run();
    },
    icon: <Heading3 className={iconClassName} />,
    id: "heading-3",
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    label: "Heading 3",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleBulletList().run();
    },
    icon: <List className={iconClassName} />,
    id: "bullet-list",
    isActive: (editor) => editor.isActive("bulletList"),
    label: "Bullet list",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleOrderedList().run();
    },
    icon: <ListOrdered className={iconClassName} />,
    id: "ordered-list",
    isActive: (editor) => editor.isActive("orderedList"),
    label: "Ordered list",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleBlockquote().run();
    },
    icon: <TextQuote className={iconClassName} />,
    id: "blockquote",
    isActive: (editor) => editor.isActive("blockquote"),
    label: "Quote",
  },
  {
    command: (editor) => {
      chainFocus(editor).toggleCodeBlock().run();
    },
    icon: <SquareCode className={iconClassName} />,
    id: "code-block",
    isActive: (editor) => editor.isActive("codeBlock"),
    label: "Code block",
  },
  {
    command: (editor) => {
      chainFocus(editor).setHorizontalRule().run();
    },
    icon: <Minus className={iconClassName} />,
    id: "divider",
    label: "Divider",
  },
];
