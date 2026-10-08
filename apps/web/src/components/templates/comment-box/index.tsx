"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Composer } from "./composer";
import { CommentThread } from "./thread";
import type { CommentBoxProps, CommentItem, ThreadActions } from "./types";
import { createId, mapThread, toggleReaction } from "./utils";

import "@editorcn/editor/style.css";
import "@editorcn/static-renderer/style.css";

export const CommentBox = ({
  className,
  currentUser = { id: "you", name: "You" },
  initialComments = [],
  onDelete,
  onPost,
  onReact,
  placeholder = "Add a comment…",
  title = "Comments",
}: CommentBoxProps) => {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const total = comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0
  );

  const actions: ThreadActions = {
    currentUser,
    post: (content, parentId) => {
      onPost?.(content, parentId);
      const comment: CommentItem = {
        author: currentUser,
        content,
        createdAt: new Date().toISOString(),
        id: createId(),
      };
      setComments((prev) =>
        parentId
          ? prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies ?? []), comment] }
                : c
            )
          : [...prev, comment]
      );
    },
    react: (id, emoji) => {
      onReact?.(id, emoji);
      setComments((prev) =>
        mapThread(prev, (c) =>
          c.id === id
            ? { ...c, reactions: toggleReaction(c.reactions ?? [], emoji) }
            : c
        )
      );
    },
    remove: (id) => {
      onDelete?.(id);
      setComments((prev) => mapThread(prev, (c) => (c.id === id ? null : c)));
    },
  };

  return (
    <section
      className={cn(
        "bg-background flex flex-col overflow-hidden rounded-2xl border",
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
          {total}
        </span>
      </header>
      {comments.length > 0 ? (
        <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              actions={actions}
              comment={comment}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground px-4 py-8 text-center text-sm">
          No comments yet. Start the conversation.
        </p>
      )}
      <Composer
        author={currentUser}
        className="shrink-0 border-t px-4 py-4"
        onPost={(content) => actions.post(content)}
        placeholder={placeholder}
      />
    </section>
  );
};

export type {
  CommentAuthor,
  CommentBoxProps,
  CommentItem,
  CommentReaction,
  CommentReply,
} from "./types";
