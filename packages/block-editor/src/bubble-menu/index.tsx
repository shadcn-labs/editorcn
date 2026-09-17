import { isTextSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { useState, useCallback } from "react";

import { DEFAULT_ICONS } from "../icons";
import { BubbleButton, BubbleSeparator } from "../ui";
import { TextAlignSelector } from "./align-selector";
import { ColorSelector } from "./color-selector";
import { LanguageSelector } from "./language-selector";
import { LinkSelector } from "./link-selector";
import { NodeSelector } from "./node-selector";
import { TextButtons } from "./text-buttons";
import { useEditorState, shallowEqual } from "./utils";

export interface BubbleMenuProps {
  editor: Editor | null;
}

export const BubbleMenu = ({ editor }: BubbleMenuProps) => {
  const [copied, setCopied] = useState(false);
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

  const hasTextAlign = editor.extensionManager.extensions.some(
    (ext) => ext.name === "textAlign"
  );

  const isCodeBlockActive = editorState.isCodeBlock;

  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ offset: 8, placement: "top" }}
      shouldShow={shouldShow}
    >
      <div className="block-editor-bubble-menu">
        {isCodeBlockActive ? (
          <>
            <NodeSelector editor={editor} />
            <BubbleSeparator />
            <LanguageSelector editor={editor} />
            <BubbleSeparator />
            <BubbleButton
              onMouseDown={(e) => e.preventDefault()}
              onClick={async () => {
                const { from, to } = editor.state.selection;
                const text = editor.state.doc.textBetween(from, to, "\n");
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* ignored */
                }
              }}
            >
              <span
                className={`block-editor-copy-icon${copied ? " block-editor-copy-icon--copied" : ""}`}
              >
                {copied ? DEFAULT_ICONS.checkIcon : DEFAULT_ICONS.copyIcon}
              </span>
            </BubbleButton>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </TiptapBubbleMenu>
  );
};
