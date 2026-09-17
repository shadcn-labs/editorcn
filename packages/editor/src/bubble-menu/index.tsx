import { isTextSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { useCallback } from "react";

import { RteSeparator } from "../ui";
import { ColorSelector } from "./color-selector";
import { LanguageSelector } from "./language-selector";
import { TextButtons } from "./text-buttons";
import { useEditorState, shallowEqual } from "./utils";

export interface BubbleMenuProps {
  editor: Editor | null;
}

export const BubbleMenu = ({ editor }: BubbleMenuProps) => {
  const editorState = useEditorState(
    editor,
    (ed) => ({
      isCodeBlock: ed.isActive("codeBlock"),
    }),
    shallowEqual
  );

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
      if (selection.empty && !ed.isActive("codeBlock")) {
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

  const isCodeBlockActive = editorState?.isCodeBlock ?? false;

  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ offset: 8, placement: "top" }}
      shouldShow={shouldShow}
    >
      <div className="rte-bubble-menu">
        {isCodeBlockActive ? (
          <LanguageSelector editor={editor} />
        ) : (
          <>
            <TextButtons editor={editor} />
            <RteSeparator />
            <ColorSelector editor={editor} />
          </>
        )}
      </div>
    </TiptapBubbleMenu>
  );
};
