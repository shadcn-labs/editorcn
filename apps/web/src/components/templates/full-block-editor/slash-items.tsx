import { defaultSlashCommandItems } from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import { calloutSlashCommandItem } from "@editorcn/extensions/callout";
import { imagePlaceholderSlashCommandItem } from "@editorcn/extensions/image-placeholder";
import { getMarkdownSlashCommandItems } from "@editorcn/extensions/markdown";
import { tableSlashCommandItem } from "@editorcn/extensions/table";
import { toggleSlashCommandItem } from "@editorcn/extensions/toggle";

export const createSlashItems = (
  markdownFilename: string
): SlashCommandSuggestionItem[] => [
  ...defaultSlashCommandItems,
  imagePlaceholderSlashCommandItem,
  tableSlashCommandItem,
  calloutSlashCommandItem,
  toggleSlashCommandItem,
  ...getMarkdownSlashCommandItems(markdownFilename),
];
