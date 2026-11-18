"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { SendIcon } from "lucide-react";
import { Suspense, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

import { Toolbar } from "./toolbar";
import type { EmailComposerProps } from "./types";
import { FIELD, STARTER_KIT, modKey } from "./utils";

import "@editorcn/editor/style.css";

const EmailComposerInner = ({
  className,
  initialContent,
  initialSubject = "",
  initialTo = "",
  onDiscard,
  onSend,
  placeholder = "Write your message…",
  title = "New message",
}: EmailComposerProps) => {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    content: initialContent ?? "",
    editorProps: {
      handleKeyDown: (_, event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          form.current?.requestSubmit();
          return true;
        }
        return false;
      },
    },
    extensions: [STARTER_KIT, Link, Placeholder.configure({ placeholder })],
    immediatelyRender: false,
    onCreate: ({ editor: e }) => setIsEmpty(e.isEmpty),
    onUpdate: ({ editor: e }) => setIsEmpty(e.isEmpty),
    shouldRerenderOnTransaction: false,
  });

  const canSend = to.trim() !== "" && !isEmpty && !sending;

  const reset = () => {
    setTo(initialTo);
    setSubject(initialSubject);
    setError(false);
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(initialContent ?? "");
      setIsEmpty(editor.isEmpty);
    }
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor || editor.isDestroyed || !canSend) {
      return;
    }
    setSending(true);
    setError(false);
    try {
      await onSend?.({
        // ProseMirror keeps attrs in null-prototype objects, which React
        // can't send to a server action. structuredClone makes them plain.
        content: structuredClone(editor.getJSON()),
        subject: subject.trim(),
        to: to.trim(),
      });
    } catch {
      setError(true);
      return;
    } finally {
      setSending(false);
    }
    reset();
  };

  const discard = () => {
    reset();
    onDiscard?.();
  };

  return (
    <form
      ref={form}
      aria-labelledby={`${id}-title`}
      className={cn(
        "bg-background flex flex-col overflow-hidden rounded-xl border",
        className
      )}
      onSubmit={send}
    >
      <header className="flex shrink-0 items-center border-b px-4 py-3">
        <h3 className="text-sm font-semibold" id={`${id}-title`}>
          {title}
        </h3>
      </header>
      <div className="flex shrink-0 items-center gap-3 border-b px-4">
        <label
          className="text-muted-foreground w-14 shrink-0 text-sm"
          htmlFor={`${id}-to`}
        >
          To
        </label>
        <input
          autoComplete="email"
          className={FIELD}
          disabled={sending}
          id={`${id}-to`}
          inputMode="email"
          multiple
          name="to"
          onChange={(event) => setTo(event.target.value)}
          placeholder="name@example.com"
          type="email"
          value={to}
        />
      </div>
      <div className="flex shrink-0 items-center gap-3 border-b px-4">
        <label
          className="text-muted-foreground w-14 shrink-0 text-sm"
          htmlFor={`${id}-subject`}
        >
          Subject
        </label>
        <input
          className={FIELD}
          disabled={sending}
          id={`${id}-subject`}
          name="subject"
          onChange={(event) => setSubject(event.target.value)}
          type="text"
          value={subject}
        />
      </div>
      <RichTextEditor
        className="flex min-h-0 flex-1 flex-col rounded-none! border-0! bg-transparent!"
        editable={!sending}
        editor={editor}
        variant="compact"
      >
        <Toolbar />
        <div
          className="min-h-0 flex-1 cursor-text overflow-y-auto"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              event.preventDefault();
              editor?.commands.focus("end");
            }
          }}
        >
          <RichTextEditor.Content className="[&_.ProseMirror]:min-h-48! [&_.ProseMirror]:px-4! [&_.ProseMirror]:py-3! [&_.ProseMirror]:text-base sm:[&_.ProseMirror]:text-sm" />
        </div>
      </RichTextEditor>
      <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t px-4 py-3">
        {error ? (
          <p className="text-destructive text-xs" role="alert">
            Couldn't send. Try again.
          </p>
        ) : (
          <KbdGroup className="text-muted-foreground hidden sm:inline-flex">
            <Kbd suppressHydrationWarning>{modKey()}</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            className="rounded-lg"
            disabled={sending}
            onClick={discard}
            size="sm"
            type="button"
            variant="ghost"
          >
            Discard
          </Button>
          <Button
            className="rounded-lg"
            disabled={!canSend}
            size="sm"
            type="submit"
          >
            <SendIcon />
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </footer>
    </form>
  );
};

// Tiptap's useEditor reads Math.random(), which Next.js `cacheComponents`
// rejects during prerender unless the component sits under a Suspense boundary.
export const EmailComposer = (props: EmailComposerProps) => (
  <Suspense fallback={null}>
    <EmailComposerInner {...props} />
  </Suspense>
);

export type { EmailComposerProps, EmailMessage } from "./types";
