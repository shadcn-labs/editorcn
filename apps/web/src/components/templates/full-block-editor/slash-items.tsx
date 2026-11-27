import { defaultSlashCommandItems } from "@editorcn/block-editor";
import type { SlashCommandSuggestionItem } from "@editorcn/block-editor";
import { calloutSlashCommandItem } from "@editorcn/extensions/callout";
import { imagePlaceholderSlashCommandItem } from "@editorcn/extensions/image-placeholder";
import { getMarkdownSlashCommandItems } from "@editorcn/extensions/markdown";
import { mermaidSlashCommandItem } from "@editorcn/extensions/mermaid";
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
  mermaidSlashCommandItem,
  ...getMarkdownSlashCommandItems(markdownFilename),
];
