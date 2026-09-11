"use client";

import { FloatingMenu, FloatingMenuExtension } from "@editorcn/floating-menu";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "@editorcn/floating-menu/style.css";

interface ChatMessage {
  id: number;
  html: string;
}

export const ChatInputPreview = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      html: "Hey! Type below, then select your text for formatting.",
      id: 1,
    },
  ]);
  const idRef = useRef(2);
  const sendRef = useRef<(() => void) | null>(null);

  const editor = useEditor({
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          sendRef.current?.();
          return true;
        }
        return false;
      },
    },
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Message" }),
      FloatingMenuExtension,
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const send = () => {
    if (!editor || editor.isEmpty) {
      return;
    }
    const id = idRef.current;
    idRef.current += 1;
    setMessages((prev) => [...prev, { html: editor.getHTML(), id }]);
    editor.commands.clearContent();
  };

  useEffect(() => {
    sendRef.current = send;
  });

  return (
    <div className="overflow-hidden rounded-md border border-border font-inter">
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto bg-muted/40 p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-3 py-1.5 text-sm text-primary-foreground [&_p]:m-0"
            // Demo only: renders HTML produced by our own editor above.
            dangerouslySetInnerHTML={{ __html: message.html }}
          />
        ))}
      </div>
      <div className="flex items-end gap-2 border-t border-border bg-background p-2">
        <EditorContent
          editor={editor}
          className={cn(
            "min-w-0 flex-1 rounded-2xl bg-muted px-3 py-2 text-sm",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror_p]:m-0",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
          )}
        />
        {/* Formatting actions on text selection (zero-config defaults) */}
        <FloatingMenu editor={editor} />
        <Button
          type="button"
          size="icon"
          aria-label="Send message"
          onClick={send}
        >
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );
};
