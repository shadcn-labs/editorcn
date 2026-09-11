import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

export interface FloatingMenuOptions {
  shouldShow?: (props: { editor: Editor }) => boolean;
}

export const defaultFloatingMenuShouldShow = ({
  editor,
}: {
  editor: Editor;
}): boolean => {
  if (
    !editor.isEditable ||
    !editor.isFocused ||
    !editor.state.selection.empty
  ) {
    return false;
  }
  // Empty textblock only: typing hides the menu.
  const { $from } = editor.state.selection;
  return $from.parent.isTextblock && $from.parent.textContent === "";
};

export const FloatingMenuExtension = Extension.create<FloatingMenuOptions>({
  addOptions() {
    return {
      // Cursor on an empty textblock only: the bubble menu owns text
      // selections, and typing hides the menu.
      shouldShow: defaultFloatingMenuShouldShow,
    };
  },

  name: "floatingMenu",
});
