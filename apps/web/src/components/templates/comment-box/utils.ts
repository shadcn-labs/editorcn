import { Mention } from "@editorcn/extensions/mention";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";

import type {
  CommentAuthor,
  CommentItem,
  CommentReaction,
  CommentReply,
} from "./types";

export const EMOJIS = ["👍", "❤️", "🎉", "😄", "👀", "🚀"];

export const ITEM =
  "rounded-md py-1 text-[13px] [&_svg:not([class*='size-'])]:size-3.5";

export const STARTER_KIT = StarterKit.configure({
  blockquote: false,
  codeBlock: false,
  heading: false,
  horizontalRule: false,
});

export const EXTENSIONS = [STARTER_KIT, Mention];

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3600],
  ["minute", 60],
];

export const timeAgo = (iso: string) => {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const match = UNITS.find(([, size]) => Math.abs(seconds) >= size);
  return match
    ? format.format(Math.round(seconds / match[1]), match[0])
    : "just now";
};

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const toggleReaction = (
  reactions: CommentReaction[],
  emoji: string
): CommentReaction[] => {
  const existing = reactions.find((r) => r.emoji === emoji);
  if (!existing) {
    return [...reactions, { count: 1, emoji, reacted: true }];
  }
  return reactions
    .map((r) =>
      r.emoji === emoji
        ? { ...r, count: r.count + (r.reacted ? -1 : 1), reacted: !r.reacted }
        : r
    )
    .filter((r) => r.count > 0);
};

export const mention = (author: CommentAuthor): JSONContent => ({
  content: [
    {
      content: [
        { attrs: { id: author.id, label: author.name }, type: "mention" },
        { text: " ", type: "text" },
      ],
      type: "paragraph",
    },
  ],
  type: "doc",
});

export const collectAuthors = (comments: CommentItem[]): CommentAuthor[] => [
  ...new Map(
    comments
      .flatMap((c) => [c, ...(c.replies ?? [])])
      .map((c) => [c.author.id, c.author] as const)
  ).values(),
];

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const mapLevel = <T extends CommentReply>(
  list: T[],
  update: (comment: CommentReply) => CommentReply | null
): T[] =>
  list.flatMap((comment) => {
    const next = update(comment);
    return next ? [{ ...comment, ...next }] : [];
  });

export const mapThread = (
  list: CommentItem[],
  update: (comment: CommentReply) => CommentReply | null
): CommentItem[] =>
  mapLevel(list, update).map((comment) =>
    comment.replies
      ? { ...comment, replies: mapLevel(comment.replies, update) }
      : comment
  );
