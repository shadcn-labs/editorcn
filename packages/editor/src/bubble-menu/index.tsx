import { isTextSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { useCallback } from "react";

import { Separator } from "../ui";
import { ColorSelector } from "./color-selector";
import { TextButtons, getTextItems } from "./text-buttons";

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

  const hasText = getTextItems(editor).length > 0;
  const hasColor = editor.extensionManager.extensions.some(
    (ext) => ext.name === "color" || ext.name === "highlight"
  );

  if (!(hasText || hasColor)) {
    return null;
  }

  return (
    <TiptapBubbleMenu
      className="z-50"
      editor={editor}
      options={{ offset: 8, placement: "top" }}
      shouldShow={shouldShow}
    >
      <div className="rte-bubble-menu flex h-10 animate-rte-bubble-pop-in items-center rounded-lg border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-popover px-1 text-popover-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]">
        {hasText && <TextButtons editor={editor} />}
        {hasText && hasColor && <Separator />}
        {hasColor && <ColorSelector editor={editor} />}
      </div>
    </TiptapBubbleMenu>
  );
};
