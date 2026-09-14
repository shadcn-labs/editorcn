import type { ChainedCommands, Editor } from "@tiptap/core";

export const chainFocus = (editor: Editor): ChainedCommands =>
  editor.chain().focus();

export const isValidUrl = (url: string): boolean =>
  /^https?:\/\/\S+$/.test(url);