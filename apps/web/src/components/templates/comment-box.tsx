"use client";

import { RichTextEditor } from "@editorcn/editor";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useCallback, useState } from "react";

import "@editorcn/editor/style.css";

export interface CommentItem {
  author: string;
  html: string;
  id: string;
}

export interface CommentBoxProps {
  className?: string;
  currentAuthor?: string;
  initialComments?: CommentItem[];
  onPost?: (html: string) => void;
  placeholder?: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const isEmpty = (html: string) =>
  html
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", "")
    .trim() === "";

export const CommentBox = ({
  className,
  currentAuthor = "You",
  initialComments = [],
  onPost,
  placeholder = "Write a comment…",
}: CommentBoxProps) => {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);

  const editor = useEditor({
    content: "",
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        orderedList: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const post = useCallback(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    const html = editor.getHTML();
    if (isEmpty(html)) {
      return;
    }
    onPost?.(html);
    setComments((prev) => [
      ...prev,
      { author: currentAuthor, html, id: `comment-${Date.now()}` },
    ]);
    editor.commands.clearContent();
  }, [currentAuthor, editor, onPost]);

  return (
    <div
      className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}
    >
      {comments.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span
                aria-hidden
                className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
              >
                {initials(comment.author)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{comment.author}</p>
                <div
                  className="text-muted-foreground text-sm"
                  dangerouslySetInnerHTML={{ __html: comment.html }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-3">
        <span
          aria-hidden
          className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
        >
          {initials(currentAuthor)}
        </span>
        <div className="min-w-0 flex-1">
          <RichTextEditor editor={editor} variant="subtle">
            <RichTextEditor.Content />
          </RichTextEditor>
          <div className="mt-2 flex justify-end">
            <button
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              onClick={post}
              type="button"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
