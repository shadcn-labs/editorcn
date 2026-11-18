"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { SendIcon, Trash2Icon } from "lucide-react";
import { Suspense, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Toolbar } from "./toolbar";
import type { EmailComposerProps } from "./types";
import { FIELD, LABEL, ROW, STARTER_KIT } from "./utils";

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
        "border-border/60 bg-muted/50 flex flex-col overflow-hidden rounded-xl border p-1",
        className
      )}
      onSubmit={send}
    >
      <header className="flex min-h-9 shrink-0 items-center justify-between gap-2 px-2.5 pb-1">
        <h3 className="text-sm font-semibold" id={`${id}-title`}>
          {title}
        </h3>
        {error && (
          <p
            className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400"
            role="alert"
          >
            Couldn't send. Try again.
          </p>
        )}
      </header>
      <RichTextEditor
        className="flex min-h-0 flex-1 flex-col rounded-none! border-0! bg-transparent!"
        editable={!sending}
        editor={editor}
        variant="compact"
      >
        <div className="border-border/60 bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <div className={ROW}>
            <label className={LABEL} htmlFor={`${id}-to`}>
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
          <div className={ROW}>
            <label className={LABEL} htmlFor={`${id}-subject`}>
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
          <div
            className="min-h-0 flex-1 cursor-text overflow-y-auto"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                event.preventDefault();
                editor?.commands.focus("end");
              }
            }}
          >
            <RichTextEditor.Content className="[&_.ProseMirror]:min-h-48! [&_.ProseMirror]:px-4! [&_.ProseMirror]:py-3! [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-relaxed sm:[&_.ProseMirror]:text-sm" />
          </div>
        </div>
        {/* The footer is the container (not the form) so the composer keeps its
            own width inside shrink-to-fit parents like dialogs and popovers. */}
        <footer className="@container flex shrink-0 items-center gap-2 px-0.5 pt-1">
          <Toolbar />
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              aria-label="Discard"
              className="text-muted-foreground hover:text-foreground rounded-md"
              disabled={sending}
              onClick={discard}
              size="icon-sm"
              title="Discard"
              type="button"
              variant="ghost"
            >
              <Trash2Icon />
            </Button>
            <Button
              aria-keyshortcuts="Control+Enter Meta+Enter"
              className="rounded-lg"
              disabled={!canSend}
              size="sm"
              type="submit"
            >
              <SendIcon />
              <span className="sr-only @[22rem]:not-sr-only">
                {sending ? "Sending…" : "Send"}
              </span>
            </Button>
          </div>
        </footer>
      </RichTextEditor>
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
