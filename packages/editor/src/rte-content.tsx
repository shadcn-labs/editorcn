import { cn } from "@editorcn/editor-ui/editor/ui/utils";
import { EditorContent } from "@tiptap/react";

import { useRichTextEditorContext } from "./rte-context";
import type { RichTextEditorContentProps } from "./types";

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
      />
      {children}
    </div>
  );
};
