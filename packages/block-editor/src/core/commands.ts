import type { Editor } from "@tiptap/core";

export interface BlockEditorChainedCommands {
  deleteRange: (range: {
    from: number;
    to: number;
  }) => BlockEditorChainedCommands;
  extendMarkRange: (name?: string) => BlockEditorChainedCommands;
  run: () => boolean;
  setHorizontalRule: () => BlockEditorChainedCommands;
  setLink: (attributes: { href: string }) => BlockEditorChainedCommands;
  setNode: (
    typeOrName: string,
    attributes?: Record<string, unknown>
  ) => BlockEditorChainedCommands;
  setParagraph: () => BlockEditorChainedCommands;
  setColor: (color: string) => BlockEditorChainedCommands;
  setHighlight: (attributes: { color: string }) => BlockEditorChainedCommands;
  setTextAlign: (alignment: string) => BlockEditorChainedCommands;
  toggleBlockquote: () => BlockEditorChainedCommands;
  toggleBold: () => BlockEditorChainedCommands;
  toggleBulletList: () => BlockEditorChainedCommands;
  toggleCode: () => BlockEditorChainedCommands;
  toggleCodeBlock: (attributes?: {
    language?: string;
  }) => BlockEditorChainedCommands;
  toggleHeading: (attributes: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  }) => BlockEditorChainedCommands;
  toggleItalic: () => BlockEditorChainedCommands;
  toggleNode: (
    typeOrName: string,
    innerTypeOrName: string,
    attributes?: Record<string, unknown>
  ) => BlockEditorChainedCommands;
  toggleOrderedList: () => BlockEditorChainedCommands;
  toggleStrike: () => BlockEditorChainedCommands;
  toggleTaskList: () => BlockEditorChainedCommands;
  toggleUnderline: () => BlockEditorChainedCommands;
  unsetColor: () => BlockEditorChainedCommands;
  unsetHighlight: () => BlockEditorChainedCommands;
  unsetLink: () => BlockEditorChainedCommands;
}

export const chainFocus = (editor: Editor): BlockEditorChainedCommands =>
  editor.chain().focus() as unknown as BlockEditorChainedCommands;
