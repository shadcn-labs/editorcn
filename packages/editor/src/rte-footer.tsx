import { useEffect, useMemo, useRef, useState } from "react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorFooterProps } from "./types";
import { cn } from "./ui/utils";

export const Footer = ({
  children,
  className,
  sticky = false,
  stickyOffset = 0,
  showWordCount = false,
  wordCountClassName,
  wordCountFormatter,
}: RichTextEditorFooterProps) => {
  const { editor, variant } = useRichTextEditorContext();
  const [, forceUpdate] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor || !showWordCount) {
      return;
    }

    const scheduleUpdate = () => {
      if (rafRef.current !== null) {
        return;
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        forceUpdate((t) => t + 1);
      });
    };

    const handleTransaction = ({
      transaction,
    }: {
      transaction: { docChanged: boolean };
    }) => {
      if (transaction.docChanged) {
        scheduleUpdate();
      }
    };

    editor.on("transaction", handleTransaction);
    scheduleUpdate();

    return () => {
      editor.off("transaction", handleTransaction);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [editor, showWordCount]);

  const wordCount = useMemo(() => {
    if (!editor || !showWordCount) {
      return null;
    }

    const count = (editor.storage as unknown as Record<string, unknown>)
      .characterCount as
      | { words: () => number; characters: () => number }
      | undefined;
    const words = count?.words() ?? 0;
    const characters = count?.characters() ?? 0;

    return { characters, words };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editor,
    showWordCount,
    wordCountFormatter,
    editor?.state.doc.content.size,
  ]);

  if (!showWordCount && !children) {
    return null;
  }

  return (
    <div
      className={cn(
        "rte-footer z-1 flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-es-[calc(var(--radius)+3px)] rounded-ee-[calc(var(--radius)+3px)] border-t border-(--rte-hairline) bg-(--rte-strip) px-3 py-1.5 text-[0.75rem] text-muted-foreground",
        variant !== "default" && `rte-footer--${variant}`,
        variant === "default" &&
          "min-h-8 rounded-none border-t-0 bg-transparent px-2 pt-1 pb-0",
        variant === "compact" &&
          "rounded-none last:rounded-es-[calc(var(--radius)-1px)] last:rounded-ee-[calc(var(--radius)-1px)]",
        sticky &&
          "sticky bottom-0 bg-[color-mix(in_srgb,var(--rte-strip)_80%,transparent)] backdrop-blur-lg",
        className
      )}
      data-sticky={sticky ? "" : undefined}
      style={sticky ? { bottom: stickyOffset } : undefined}
    >
      {showWordCount && wordCount && (
        <span
          className={cn(
            "rte-footer-word-count inline-flex items-center gap-1.5 text-[0.75rem] whitespace-nowrap",
            wordCountClassName
          )}
        >
          {wordCountFormatter ? (
            wordCountFormatter(wordCount)
          ) : (
            <>
              <span className="rte-footer-word-count-stat inline-flex items-baseline gap-1">
                <span className="rte-footer-word-count-number font-medium text-foreground tabular-nums">
                  {wordCount.words}
                </span>
                <span className="rte-footer-word-count-unit text-muted-foreground">
                  words
                </span>
              </span>
              <span
                className="rte-footer-word-count-separator size-[3px] shrink-0 rounded-full bg-[color-mix(in_srgb,var(--muted-foreground)_45%,transparent)]"
                aria-hidden="true"
              />
              <span className="rte-footer-word-count-stat inline-flex items-baseline gap-1">
                <span className="rte-footer-word-count-number font-medium text-foreground tabular-nums">
                  {wordCount.characters}
                </span>
                <span className="rte-footer-word-count-unit text-muted-foreground">
                  characters
                </span>
              </span>
            </>
          )}
        </span>
      )}
      {children}
    </div>
  );
};
