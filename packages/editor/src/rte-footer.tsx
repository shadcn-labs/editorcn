import { cn } from "@editorcn/editor-ui/lib/cn";
import { useEffect, useMemo, useRef, useState } from "react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorFooterProps } from "./types";

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
        "rte-footer",
        variant !== "default" && `rte-footer--${variant}`,
        sticky && "sticky z-10",
        className
      )}
      data-sticky={sticky ? "" : undefined}
      style={sticky ? { bottom: stickyOffset } : undefined}
    >
      {showWordCount && wordCount && (
        <span className={cn("rte-footer-word-count", wordCountClassName)}>
          {wordCountFormatter ? (
            wordCountFormatter(wordCount)
          ) : (
            <>
              <span className="rte-footer-word-count-stat">
                <span className="rte-footer-word-count-number">
                  {wordCount.words}
                </span>
                <span className="rte-footer-word-count-unit">words</span>
              </span>
              <span
                className="rte-footer-word-count-separator"
                aria-hidden="true"
              />
              <span className="rte-footer-word-count-stat">
                <span className="rte-footer-word-count-number">
                  {wordCount.characters}
                </span>
                <span className="rte-footer-word-count-unit">characters</span>
              </span>
            </>
          )}
        </span>
      )}
      {children}
    </div>
  );
};
