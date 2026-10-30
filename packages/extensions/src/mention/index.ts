import { createInlineMarkdownSpec } from "@tiptap/core";
import { Mention as TiptapMention } from "@tiptap/extension-mention";
import type { MentionOptions as TiptapMentionOptions } from "@tiptap/extension-mention";
import type { EditorState } from "@tiptap/pm/state";
import { PluginKey } from "@tiptap/pm/state";
import type { ReactNode } from "react";

import { renderMentionList } from "./mention-list";

export interface MentionItem {
  avatar?: string;
  description?: string;
  id: string;
  label: string;
}

export interface MentionOptions extends TiptapMentionOptions<MentionItem> {
  debounce: number;
  heading?: string;
  items: (query: string) => MentionItem[] | Promise<MentionItem[]>;
  renderItem?: (item: MentionItem) => ReactNode;
  trigger: string;
}

export const mentionPluginKey = new PluginKey("mention");

export const isMentionActive = (state: EditorState): boolean =>
  Boolean(mentionPluginKey.getState(state)?.active);

const ENCODED: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "[": "&#91;",
  "]": "&#93;",
};

const DECODED: Record<string, string> = Object.fromEntries(
  Object.entries(ENCODED).map(([raw, safe]) => [safe, raw])
);

const encode = (value: unknown) =>
  String(value).replaceAll(/[&"[\]]/g, (char) => ENCODED[char] ?? char);

const decode = (value: string) =>
  value.replaceAll(
    /&(?:amp|quot|#91|#93);/g,
    (entity) => DECODED[entity] ?? entity
  );

const mentionText = (attrs: Record<string, unknown>) =>
  `${attrs.mentionSuggestionChar ?? "@"}${attrs.label ?? attrs.id}`;

export const Mention = TiptapMention.extend<MentionOptions>({
  ...createInlineMarkdownSpec({
    allowedAttributes: ["id", "label"],
    nodeName: "mention",
    parseAttributes: (text) =>
      Object.fromEntries(
        [...text.matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [
          key,
          decode(value ?? ""),
        ])
      ),
    selfClosing: true,
    serializeAttributes: (attrs) =>
      Object.entries(attrs)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}="${encode(value)}"`)
        .join(" "),
  }),

  addOptions() {
    return {
      ...(this.parent?.() as TiptapMentionOptions<MentionItem>),
      debounce: 150,
      deleteTriggerWithBackspace: true,
      heading: undefined,
      items: () => [],
      renderHTML: ({ node, options }) => [
        "span",
        options.HTMLAttributes,
        mentionText(node.attrs),
      ],
      renderItem: undefined,
      renderText: ({ node }) => mentionText(node.attrs),
      trigger: "@",
    };
  },

  addProseMirrorPlugins() {
    const { debounce, heading, items, renderItem, suggestion, trigger } =
      this.options;
    this.options.suggestion = {
      char: trigger,
      debounce,
      items: ({ query }) => items(query),
      pluginKey: mentionPluginKey,
      render: () => renderMentionList({ heading, renderItem }),
      ...suggestion,
    };
    return this.parent?.() ?? [];
  },
});
