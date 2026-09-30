import {
  BubbleButton,
  BubbleDropdown,
  BubbleDropdownDivider,
  BubbleDropdownIcon,
  BubbleDropdownItem,
  DropdownOverlay,
} from "@editorcn/editor-ui/block-editor";
import type { Editor } from "@tiptap/react";
import { useState } from "react";

import { DEFAULT_ICONS, HeadingIcon } from "../icons";
import { useEditorState, copyBlock, deleteBlock, shallowEqual } from "./utils";

interface SelectorResult {
  isParagraph: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isTaskList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
}

interface NodeItem {
  command: (editor: Editor) => void;
  icon: React.ReactNode;
  isActive: (state: SelectorResult) => boolean;
  name: string;
}

interface NodeChain {
  run(): boolean;
  setParagraph(): NodeChain;
  toggleBlockquote(): NodeChain;
  toggleBulletList(): NodeChain;
  toggleCodeBlock(): NodeChain;
  toggleHeading(options: { level: number }): NodeChain;
  toggleOrderedList(): NodeChain;
  toggleTaskList(): NodeChain;
}

const nodeItems: NodeItem[] = [
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain).setParagraph().run(),
    icon: DEFAULT_ICONS.slashTextIcon,
    isActive: (s) =>
      s.isParagraph &&
      !s.isBulletList &&
      !s.isOrderedList &&
      !s.isTaskList &&
      !s.isBlockquote &&
      !s.isCodeBlock,
    name: "Text",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain)
        .toggleHeading({ level: 1 })
        .run(),
    icon: <HeadingIcon level={1} />,
    isActive: (s) => s.isHeading1,
    name: "Heading 1",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain)
        .toggleHeading({ level: 2 })
        .run(),
    icon: <HeadingIcon level={2} />,
    isActive: (s) => s.isHeading2,
    name: "Heading 2",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain)
        .toggleHeading({ level: 3 })
        .run(),
    icon: <HeadingIcon level={3} />,
    isActive: (s) => s.isHeading3,
    name: "Heading 3",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain).toggleBulletList().run(),
    icon: DEFAULT_ICONS.slashBulletListIcon,
    isActive: (s) => s.isBulletList,
    name: "Bullet List",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain).toggleOrderedList().run(),
    icon: DEFAULT_ICONS.slashOrderedListIcon,
    isActive: (s) => s.isOrderedList,
    name: "Numbered List",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain).toggleTaskList().run(),
    icon: DEFAULT_ICONS.slashTaskListIcon,
    isActive: (s) => s.isTaskList,
    name: "To-do List",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain).toggleBlockquote().run(),
    icon: DEFAULT_ICONS.slashBlockquoteIcon,
    isActive: (s) => s.isBlockquote,
    name: "Quote",
  },
  {
    command: (e) =>
      (e.chain().focus() as unknown as NodeChain).toggleCodeBlock().run(),
    icon: DEFAULT_ICONS.slashCodeBlockIcon,
    isActive: (s) => s.isCodeBlock,
    name: "Code Block",
  },
];

export const NodeSelector = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const editorState = useEditorState(
    editor,
    (ed) => ({
      isBlockquote: ed.isActive("blockquote"),
      isBulletList: ed.isActive("bulletList"),
      isCodeBlock: ed.isActive("codeBlock"),
      isHeading1: ed.isActive("heading", { level: 1 }),
      isHeading2: ed.isActive("heading", { level: 2 }),
      isHeading3: ed.isActive("heading", { level: 3 }),
      isOrderedList: ed.isActive("orderedList"),
      isParagraph: ed.isActive("paragraph"),
      isTaskList: ed.isActive("taskList"),
    }),
    shallowEqual
  );

  const activeItems = nodeItems.filter((i) => i.isActive(editorState));
  const activeName =
    activeItems.length > 1 ? "Multiple" : (activeItems[0]?.name ?? "Text");
  const activeIcon = activeItems.length === 1 ? activeItems[0]?.icon : null;

  return (
    <div style={{ position: "relative" }}>
      <BubbleButton
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
      >
        {activeIcon && <BubbleDropdownIcon>{activeIcon}</BubbleDropdownIcon>}
        <span className="block-editor-bubble-btn-text">{activeName}</span>
        {DEFAULT_ICONS.dropdownArrowIcon}
      </BubbleButton>
      {open && (
        <>
          <DropdownOverlay
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <BubbleDropdown>
            {nodeItems.map((item, i) => (
              <BubbleDropdownItem
                key={i}
                active={item.isActive(editorState)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  item.command(editor);
                  setOpen(false);
                }}
              >
                <BubbleDropdownIcon>{item.icon}</BubbleDropdownIcon>
                <span>{item.name}</span>
              </BubbleDropdownItem>
            ))}
            <BubbleDropdownDivider />
            <BubbleDropdownItem
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                copyBlock(editor);
                setOpen(false);
              }}
            >
              <BubbleDropdownIcon>{DEFAULT_ICONS.copyIcon}</BubbleDropdownIcon>
              <span>Copy</span>
            </BubbleDropdownItem>
            <BubbleDropdownItem
              danger
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                deleteBlock(editor);
                setOpen(false);
              }}
            >
              <BubbleDropdownIcon>
                {DEFAULT_ICONS.deleteIcon}
              </BubbleDropdownIcon>
              <span>Delete</span>
            </BubbleDropdownItem>
          </BubbleDropdown>
        </>
      )}
    </div>
  );
};
