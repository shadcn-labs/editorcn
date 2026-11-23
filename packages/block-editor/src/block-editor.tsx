import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node } from "@tiptap/pm/model";
import { EditorContent } from "@tiptap/react";
import { Plus } from "lucide-react";
import { useCallback, useRef } from "react";

import { BottomBar } from "./bottom-bar";
import { BubbleMenu } from "./bubble-menu";
import { BlockEditorProvider, useBlockEditorContext } from "./context";
import { cn } from "./lib/utils";
import type { BlockEditorProps } from "./types";

const computePositionConfig = {
  placement: "left-start",
  strategy: "absolute",
} as const;

const BlockEditorDragHandle = () => {
  const { editor, icons } = useBlockEditorContext();
  const dragNodeRef = useRef<{ node: Node; pos: number } | null>(null);

  const handleNodeChange = useCallback(
    ({ node, pos }: { node: Node | null; pos: number }) => {
      dragNodeRef.current = node ? { node, pos } : null;
    },
    []
  );

  const handleAdd = useCallback(() => {
    const dragNode = dragNodeRef.current;
    if (!dragNode || !editor || editor.isDestroyed) {
      return;
    }

    const { node, pos } = dragNode;
    if (node.type.spec.code || node.isLeaf) {
      return;
    }

    editor
      .chain()
      .focus(pos + 1)
      .insertContent("/")
      .run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DragHandle
      className="drag-handle flex h-6 cursor-grab items-center gap-[0.12rem] rounded-sm bg-transparent text-muted-foreground opacity-0 [transition:background-color_150ms_ease-out,color_150ms_ease-out,opacity_150ms_ease-out,transform_100ms_ease-out,top_150ms_ease-out,left_150ms_ease-out] in-[.block-editor-content:hover]:opacity-100 hover:opacity-100 active:cursor-grabbing active:[transform:scale(0.9)] [@media(hover:none)_and_(pointer:coarse)]:hidden [&_.block-editor-drag-handle-icon]:inline-flex [&_.block-editor-drag-handle-icon]:size-[1.125rem] [&_.block-editor-drag-handle-icon]:items-center [&_.block-editor-drag-handle-icon]:justify-center [&_.block-editor-drag-handle-icon_svg]:size-3.5"
      computePositionConfig={computePositionConfig}
      editor={editor}
      onNodeChange={handleNodeChange}
    >
      <button
        type="button"
        aria-label="Add block"
        className="block-editor-add-block inline-flex size-[1.125rem] cursor-pointer items-center justify-center rounded-sm border-none bg-transparent p-0 text-inherit [transition:background-color_100ms_ease-out,color_100ms_ease-out,transform_100ms_ease-out] hover:bg-accent hover:text-accent-foreground active:[transform:scale(0.9)] [&_svg]:size-3.5"
        onClick={handleAdd}
        onDragStart={(event) => event.preventDefault()}
      >
        <Plus />
      </button>
      {icons.dragHandleIcon}
    </DragHandle>
  );
};

const BlockEditorContent = () => {
  const { editor, preset } = useBlockEditorContext();

  return (
    <div className="block-editor relative w-full">
      {editor && editor.isEditable && <BlockEditorDragHandle />}
      {editor && editor.isEditable && <BubbleMenu editor={editor} />}
      <EditorContent
        editor={editor}
        className="block-editor-content editorcn-content w-full"
        data-preset={preset}
        spellCheck={false}
      />
      {editor && editor.isEditable && <BottomBar editor={editor} />}
    </div>
  );
};

const BlockEditorRoot = ({
  editor,
  children,
  className,
  labels,
  icons,
  preset,
}: BlockEditorProps) => (
  <BlockEditorProvider
    editor={editor}
    labels={labels}
    icons={icons}
    preset={preset}
  >
    <div className={cn("block-editor relative w-full", className)}>
      {children ?? <BlockEditorContent />}
    </div>
  </BlockEditorProvider>
);

export const BlockEditor = Object.assign(BlockEditorRoot, {
  BottomBar,
  BubbleMenu,
  Content: BlockEditorContent,
});
