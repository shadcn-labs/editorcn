"use client";

import { RichTextEditor } from "@editorcn/editor";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ArrowUp } from "lucide-react";
import { useCallback, useState } from "react";

import "@editorcn/editor/style.css";

export interface ChatMessage {
  html: string;
  id: string;
  role: "user" | "assistant";
}

export interface ChatComposerProps {
  className?: string;
  /**
   * Called with the sent message HTML. When omitted, the message is appended
   * locally and a placeholder assistant reply marks where to wire your API.
   */
  onSend?: (html: string) => void | Promise<void>;
  placeholder?: string;
}

const ASSISTANT_PLACEHOLDER =
  "<p>This is where the assistant reply goes — pass <code>onSend</code> to wire your backend.</p>";

const isEmpty = (html: string) =>
  html
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", "")
    .trim() === "";

export const ChatComposer = ({
  className,
  onSend,
  placeholder = "Message…",
}: ChatComposerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

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

  const send = useCallback(async () => {
    if (!editor || editor.isDestroyed || sending) {
      return;
    }
    const html = editor.getHTML();
    if (isEmpty(html)) {
      return;
    }
    setSending(true);
    try {
      await onSend?.(html);
      setMessages((prev) => [
        ...prev,
        { html, id: `user-${Date.now()}`, role: "user" },
        ...(onSend
          ? []
          : [
              {
                html: ASSISTANT_PLACEHOLDER,
                id: `assistant-${Date.now()}`,
                role: "assistant" as const,
              },
            ]),
      ]);
      editor.commands.clearContent();
    } finally {
      setSending(false);
    }
  }, [editor, onSend, sending]);

  return (
    <div
      className={[
        "flex flex-col gap-3 rounded-xl border border-border bg-background p-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {messages.length > 0 ? (
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-sm"
                  : "bg-muted text-foreground mr-auto max-w-[85%] rounded-2xl rounded-bl-md px-3 py-2 text-sm"
              }
              dangerouslySetInnerHTML={{ __html: message.html }}
            />
          ))}
        </div>
      ) : null}
      <RichTextEditor editor={editor} variant="compact">
        <div className="flex items-end gap-2">
          <RichTextEditor.Content className="min-w-0 flex-1" />
          <button
            aria-label="Send message"
            className="bg-primary text-primary-foreground mb-1 flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={sending}
            onClick={() => {
              send();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            type="button"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </RichTextEditor>
    </div>
  );
};
