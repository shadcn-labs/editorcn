import type { Editor } from "@tiptap/core";

export const extensionPresent = (
  editor: Editor | null,
  name: string
): boolean =>
  Boolean(
    editor &&
    !editor.isDestroyed &&
    editor.extensionManager.extensions.some(
      (extension) => extension.name === name
    )
  );

export const nodeActive = (
  editor: Editor | null,
  name: string,
  attributes?: Record<string, unknown>
): boolean =>
  Boolean(editor && !editor.isDestroyed && editor.isActive(name, attributes));
