import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";

export interface FloatingMenuOptions {
  shouldShow?: (props: { editor: Editor }) => boolean;
}

export const floatingMenuPluginKey = new PluginKey("floatingMenu");

export interface FloatingMenuPluginState {
  pos: number;
}

const defaultState: FloatingMenuPluginState = { pos: -1 };

export const FloatingMenuExtension = Extension.create<FloatingMenuOptions>({
  addOptions() {
    return {
      // Cursor on an empty textblock only: the bubble menu owns text
      // selections, and typing hides the menu.
      shouldShow: ({ editor }: { editor: Editor }) => {
        if (
          !editor.isEditable ||
          !editor.isFocused ||
          !editor.state.selection.empty
        ) {
          return false;
        }
        const { $from } = editor.state.selection;
        return $from.parent.isTextblock && $from.parent.textContent === "";
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<FloatingMenuPluginState>({
        key: floatingMenuPluginKey,
        state: {
          apply(tr, prev): FloatingMenuPluginState {
            const { selection } = tr;
            if (!selection) {
              return prev;
            }
            if (prev.pos === selection.from) {
              return prev;
            }
            return { pos: selection.from };
          },
          init(): FloatingMenuPluginState {
            return { ...defaultState };
          },
        },
      }),
    ];
  },

  name: "floatingMenu",
});

export const getFloatingMenuState = (
  editor: Editor
): FloatingMenuPluginState | undefined => {
  try {
    const pluginState = floatingMenuPluginKey.getState(editor.state);
    return (pluginState as FloatingMenuPluginState | undefined) ?? undefined;
  } catch {
    return undefined;
  }
};
