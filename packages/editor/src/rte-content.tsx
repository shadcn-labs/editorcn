import { EditorContent } from "@tiptap/react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorContentProps } from "./types";
import { cn } from "./ui/utils";

export const Content = ({
  children,
  className,
}: RichTextEditorContentProps) => {
  const { editor, preset, variant } = useRichTextEditorContext();

  return (
    <div className="relative">
      <EditorContent
        editor={editor}
        className={cn(
          "rte-content editorcn-content w-full",
          variant === "default" &&
            "rounded-lg border border-(--rte-hairline) bg-[var(--card,var(--background))]",
          className
        )}
        data-preset={preset}
        spellCheck={false}
      />
      {children}
    </div>
  );
};
