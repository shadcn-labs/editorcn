import { EditorContent } from "@tiptap/react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorContentProps } from "./types";
import { cn } from "./ui/utils";

export const Content = ({
  children,
  className,
}: RichTextEditorContentProps) => {
  const { editor } = useRichTextEditorContext();

  return (
    <div className="relative">
      <EditorContent
        editor={editor}
        className={cn("rte-content w-full", className)}
        spellCheck={false}
      />
      {children}
    </div>
  );
};
