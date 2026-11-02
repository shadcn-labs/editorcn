import { isTextSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { useCallback } from "react";

import { RteSeparator } from "../ui";
import { ColorSelector } from "./color-selector";
import { TextButtons } from "./text-buttons";

export interface BubbleMenuProps {
  editor: Editor | null;
}

export const BubbleMenu = ({ editor }: BubbleMenuProps) => {
  const shouldShow = useCallback(
    ({
      editor: ed,
      state,
    }: {
      editor: Editor;
      state: { selection: { empty: boolean } };
    }) => {
      const { selection } = state;
      if (!ed.isEditable) {
        return false;
      }
      if (selection.empty || ed.isActive("codeBlock")) {
        return false;
      }
      if (!selection.empty && !isTextSelection(selection)) {
        return false;
      }
      return true;
    },
    []
  );

  if (!editor) {
    return null;
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ offset: 8, placement: "top" }}
      shouldShow={shouldShow}
    >
      <div className="rte-bubble-menu">
        <TextButtons editor={editor} />
        <RteSeparator />
        <ColorSelector editor={editor} />
      </div>
    </TiptapBubbleMenu>
  );
};
