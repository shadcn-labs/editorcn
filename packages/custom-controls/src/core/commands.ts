import type { ChainedCommands, Editor } from "@tiptap/core";

export type ControlOperation =
  | ((editor: Editor) => void)
  | { name: string; attributes?: Record<string, unknown> | string };

export const chainFocus = (editor: Editor): ChainedCommands =>
  editor.chain().focus();

export const runOperation = (
  editor: Editor,
  operation: ControlOperation
): void => {
  if (typeof operation === "function") {
    operation(editor);
    return;
  }
  const commands = editor.chain().focus() as unknown as Record<
    string,
    (attributes?: unknown) => { run: () => boolean }
  >;
  commands[operation.name]?.(operation.attributes).run();
};
