import { isTextSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Fragment, useCallback } from "react";

import { BubbleSeparator } from "../ui";
import { TextAlignSelector } from "./align-selector";
import { ColorSelector } from "./color-selector";
import { LinkSelector } from "./link-selector";
import { NodeSelector } from "./node-selector";
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

  const has = (name: string) =>
    editor.extensionManager.extensions.some((ext) => ext.name === name);

  const sections = [
    { id: "node", node: <NodeSelector editor={editor} />, show: true },
    {
      id: "text",
      node: <TextButtons editor={editor} />,
      show: getTextItems(editor).length > 0,
    },
    {
      id: "color",
      node: <ColorSelector editor={editor} />,
      show: has("color") || has("highlight"),
    },
    { id: "link", node: <LinkSelector editor={editor} />, show: has("link") },
    {
      id: "align",
      node: <TextAlignSelector editor={editor} />,
      show: has("textAlign"),
    },
  ].filter((section) => section.show);

  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ offset: 8, placement: "top" }}
      shouldShow={shouldShow}
    >
      <div className="block-editor-bubble-menu">
        {sections.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && <BubbleSeparator />}
            {section.node}
          </Fragment>
        ))}
      </div>
    </TiptapBubbleMenu>
  );
};
