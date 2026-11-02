import { isTextSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { useCallback } from "react";

import { BubbleSeparator } from "../ui";
import { TextAlignSelector } from "./align-selector";
import { ColorSelector } from "./color-selector";
import { LinkSelector } from "./link-selector";
import { NodeSelector } from "./node-selector";
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

  const hasTextAlign = editor.extensionManager.extensions.some(
    (ext) => ext.name === "textAlign"
  );

  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ offset: 8, placement: "top" }}
      shouldShow={shouldShow}
    >
      <div className="block-editor-bubble-menu">
        <NodeSelector editor={editor} />
        <BubbleSeparator />
        <TextButtons editor={editor} />
        <BubbleSeparator />
        <ColorSelector editor={editor} />
        <BubbleSeparator />
        <LinkSelector editor={editor} />
        {hasTextAlign && (
          <>
            <BubbleSeparator />
            <TextAlignSelector editor={editor} />
          </>
        )}
      </div>
    </TiptapBubbleMenu>
  );
};
