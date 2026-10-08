"use client";

import { StaticRenderer } from "@editorcn/static-renderer";
import { generateText } from "@tiptap/core";
import {
  ChevronDown,
  Copy,
  MoreHorizontal,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Composer, UserAvatar } from "./composer";
import type {
  CommentItem,
  CommentReaction,
  CommentReply,
  ThreadActions,
} from "./types";
import { EMOJIS, EXTENSIONS, ITEM, mention, timeAgo } from "./utils";

const EmojiPicker = ({ onPick }: { onPick: (emoji: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Add reaction"
          className="text-muted-foreground size-7 rounded-full border"
          size="icon-sm"
          variant="ghost"
        >
          <SmilePlus className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-auto gap-0.5 rounded-full p-1"
      >
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            aria-label={`React with ${emoji}`}
            className="hover:bg-accent flex size-8 items-center justify-center rounded-full text-base transition-transform active:scale-96"
            onClick={() => {
              onPick(emoji);
              setOpen(false);
            }}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

const CommentMenu = ({
  canDelete,
  onCopy,
  onDelete,
}: {
  canDelete: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        aria-label="Comment options"
        className="text-muted-foreground size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100"
        size="icon-sm"
        variant="ghost"
      >
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-36 p-1">
      <DropdownMenuItem className={ITEM} onClick={onCopy}>
        <Copy />
        Copy text
      </DropdownMenuItem>
      {canDelete && (
        <DropdownMenuItem
          className={ITEM}
          onClick={onDelete}
          variant="destructive"
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

const Reactions = ({
  onReact,
  reactions,
}: {
  onReact: (emoji: string) => void;
  reactions: CommentReaction[];
}) => (
  <>
    {reactions.map((reaction) => (
      <button
        key={reaction.emoji}
        aria-pressed={reaction.reacted ?? false}
        className={cn(
          "flex h-7 items-center gap-1 rounded-full border px-2 text-xs tabular-nums transition-colors active:scale-96",
          reaction.reacted
            ? "border-primary/30 bg-primary/10 text-foreground"
            : "hover:bg-accent text-muted-foreground"
        )}
        onClick={() => onReact(reaction.emoji)}
        type="button"
      >
        <span className="text-sm">{reaction.emoji}</span>
        {reaction.count}
      </button>
    ))}
    <EmojiPicker onPick={onReact} />
  </>
);

const CommentBody = ({
  actions,
  children,
  comment,
  onReply,
  small,
  stem = false,
}: {
  actions: ThreadActions;
  children?: React.ReactNode;
  comment: CommentReply;
  onReply: () => void;
  small: boolean;
  stem?: boolean;
}) => (
  <div className="group flex gap-3">
    <div className="flex flex-col items-center">
      <UserAvatar author={comment.author} small={small} />
      {stem && <div className="bg-border mt-1 w-0.5 flex-1 rounded-full" />}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium">
          {comment.author.name}
        </span>
        <time
          className="text-muted-foreground shrink-0 text-xs"
          dateTime={comment.createdAt}
          suppressHydrationWarning
          title={new Date(comment.createdAt).toLocaleString()}
        >
          {timeAgo(comment.createdAt)}
        </time>
        <div className="ml-auto">
          <CommentMenu
            canDelete={comment.author.id === actions.currentUser.id}
            onCopy={() =>
              navigator.clipboard.writeText(
                generateText(comment.content, EXTENSIONS)
              )
            }
            onDelete={() => actions.remove(comment.id)}
          />
        </div>
      </div>
      <StaticRenderer
        className="text-foreground/90 -mt-1 text-sm [&_code]:text-[0.85em]"
        content={comment.content}
        extensions={EXTENSIONS}
      />
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Reactions
          onReact={(emoji) => actions.react(comment.id, emoji)}
          reactions={comment.reactions ?? []}
        />
        <Button
          className="text-muted-foreground h-7 rounded-full px-2.5 text-xs font-medium"
          onClick={onReply}
          size="sm"
          variant="ghost"
        >
          Reply
        </Button>
      </div>
      {children}
    </div>
  </div>
);

const ReplyToggle = ({
  count,
  onToggle,
  open,
}: {
  count: number;
  onToggle: () => void;
  open: boolean;
}) => (
  <Button
    aria-expanded={open}
    className="text-primary -ml-2.5 h-8 w-fit gap-1.5 rounded-full px-2.5 text-[13px] font-medium"
    onClick={onToggle}
    size="sm"
    variant="ghost"
  >
    {open ? "Hide replies" : `${count} ${count === 1 ? "reply" : "replies"}`}
    <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
  </Button>
);

export const CommentThread = ({
  actions,
  comment,
}: {
  actions: ThreadActions;
  comment: CommentItem;
}) => {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<CommentReply | null>(null);
  const replies = comment.replies ?? [];
  const showReplies = open && replies.length > 0;

  const replyBox = (to: CommentReply) =>
    target?.id === to.id && (
      <Composer
        author={actions.currentUser}
        autoFocus
        className="mt-2"
        initialContent={
          to.id === comment.id ? undefined : mention(to.author.name)
        }
        onCancel={() => setTarget(null)}
        onPost={(content) => {
          actions.post(content, comment.id);
          setTarget(null);
          setOpen(true);
        }}
        placeholder={`Reply to ${to.author.name}…`}
        submitLabel="Reply"
      />
    );

  return (
    <li className="animate-in fade-in px-4 py-3 duration-200">
      <CommentBody
        actions={actions}
        comment={comment}
        onReply={() => setTarget(comment)}
        small={false}
        stem={showReplies}
      >
        {replyBox(comment)}
      </CommentBody>
      <div className="pl-11">
        {showReplies && (
          <ul className="flex flex-col">
            {replies.map((reply, index) => (
              <li
                key={reply.id}
                className="animate-in fade-in relative pt-3 duration-200"
              >
                <span
                  aria-hidden
                  className="border-border absolute top-0 -left-[29px] h-[26px] w-[25px] rounded-bl-xl border-b-2 border-l-2"
                />
                {index < replies.length - 1 && (
                  <span
                    aria-hidden
                    className="bg-border absolute top-0 bottom-0 -left-[29px] w-0.5"
                  />
                )}
                <CommentBody
                  actions={actions}
                  comment={reply}
                  onReply={() => setTarget(reply)}
                  small
                >
                  {replyBox(reply)}
                </CommentBody>
              </li>
            ))}
          </ul>
        )}
        {replies.length > 0 && (
          <ReplyToggle
            count={replies.length}
            onToggle={() => setOpen((value) => !value)}
            open={open}
          />
        )}
      </div>
    </li>
  );
};
