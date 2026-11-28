import type { Editor } from "@tiptap/react";
import { useState } from "react";

import { DEFAULT_ICONS } from "../icons/icons";
import { Button, Dropdown, DropdownIcon, DropdownItem, Overlay } from "../ui";
import { useEditorState, shallowEqual } from "./utils";

interface AlignSelectorResult {
  isAlignLeft: boolean;
  isAlignCenter: boolean;
  isAlignRight: boolean;
}

interface AlignableChain {
  run(): boolean;
  setTextAlign(alignment: "center" | "left" | "right"): AlignableChain;
}

const alignItems = [
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as AlignableChain)
        .setTextAlign("left")
        .run(),
    icon: DEFAULT_ICONS.alignLeftIcon,
    isActive: (s: AlignSelectorResult) => s.isAlignLeft,
    label: "Left",
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as AlignableChain)
        .setTextAlign("center")
        .run(),
    icon: DEFAULT_ICONS.alignCenterIcon,
    isActive: (s: AlignSelectorResult) => s.isAlignCenter,
    label: "Center",
  },
  {
    command: (e: Editor) =>
      (e.chain().focus() as unknown as AlignableChain)
        .setTextAlign("right")
        .run(),
    icon: DEFAULT_ICONS.alignRightIcon,
    isActive: (s: AlignSelectorResult) => s.isAlignRight,
    label: "Right",
  },
];

export const TextAlignSelector = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const editorState = useEditorState(
    editor,
    (ed) => ({
      isAlignCenter: ed.isActive({ textAlign: "center" }),
      isAlignLeft:
        !ed.isActive({ textAlign: "center" }) &&
        !ed.isActive({ textAlign: "right" }),
      isAlignRight: ed.isActive({ textAlign: "right" }),
    }),
    shallowEqual
  );

  const activeItem = alignItems.find((i) => i.isActive(editorState));

  return (
    <div style={{ position: "relative" }}>
      <Button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
      >
        <DropdownIcon>
          {activeItem ? activeItem.icon : DEFAULT_ICONS.alignLeftIcon}
        </DropdownIcon>
        {DEFAULT_ICONS.dropdownArrowIcon}
      </Button>
      {open && (
        <>
          <Overlay
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <Dropdown align="align" style={{ left: "auto", right: 0 }}>
            {alignItems.map((item, i) => (
              <DropdownItem
                key={i}
                active={item.isActive(editorState)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  item.command(editor);
                  setOpen(false);
                }}
              >
                <DropdownIcon>{item.icon}</DropdownIcon>
                <span>{item.label}</span>
              </DropdownItem>
            ))}
          </Dropdown>
        </>
      )}
    </div>
  );
};
