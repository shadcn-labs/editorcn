import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

export interface FloatingMenuOptions {
  shouldShow?: (props: { editor: Editor }) => boolean;
}

export const showOnTextSelection = ({ editor }: { editor: Editor }): boolean =>
  editor.isEditable && editor.isFocused && !editor.state.selection.empty;

export const FloatingMenuExtension = Extension.create<FloatingMenuOptions>({
  addOptions() {
    return {
      shouldShow: showOnTextSelection,
    };
  },

  name: "floatingMenu",
});
