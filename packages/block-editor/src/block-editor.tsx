import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node } from "@tiptap/pm/model";
import { EditorContent } from "@tiptap/react";
import { Plus } from "lucide-react";
import { useCallback, useRef } from "react";

import { BubbleMenu } from "./bubble-menu";
import { BlockEditorProvider, useBlockEditorContext } from "./context";
import { cn } from "./lib/utils";
import type { BlockEditorProps } from "./types";

const BlockEditorDragHandle = () => {
  const { editor, icons } = useBlockEditorContext();
    const dragNodeRef = useRef<{ node: Node; pos: number } | null>(null);

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
                                                                                            computePositionConfig={{ placement: "left-start", strategy: "absolute" }}
                                                                                                  editor={editor}
                                                                                                        onNodeChange={({ node, pos }) => {
                                                                                                                dragNodeRef.current = node ? { node, pos } : null;
                                                                                                                      }}
                                                                                                                          >
                                                                                                                                <button
                                                                                                                                        type="button"
                                                                                                                                                aria-label="Add block"
                                                                                                                                                        className="block-editor-add-block"
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
                                                                                                                                                                                                          const { editor } = useBlockEditorContext();

                                                                                                                                                                                                            return (
                                                                                                                                                                                                                <div className="block-editor">
                                                                                                                                                                                                                      {editor && editor.isEditable && <BlockEditorDragHandle />}
                                                                                                                                                                                                                            {editor && editor.isEditable && <BubbleMenu editor={editor} />}
                                                                                                                                                                                                                                  <EditorContent editor={editor} className="block-editor-content" />
                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                        };

                                                                                                                                                                                                                                        const BlockEditorRoot = ({
                                                                                                                                                                                                                                          editor,
                                                                                                                                                                                                                                            children,
                                                                                                                                                                                                                                              className,
                                                                                                                                                                                                                                                labels,
                                                                                                                                                                                                                                                  icons,
                                                                                                                                                                                                                                                    aiConfig, // تفكيك خاصية الـ AI الجديدة هنا
                                                                                                                                                                                                                                                    }: BlockEditorProps) => (
                                                                                                                                                                                                                                                      <BlockEditorProvider editor={editor} labels={labels} icons={icons} aiConfig={aiConfig}>
                                                                                                                                                                                                                                                          <div className={cn("block-editor", className)}>
                                                                                                                                                                                                                                                                {children ?? <BlockEditorContent />}
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                      </BlockEditorProvider>
                                                                                                                                                                                                                                                                      );

                                                                                                                                                                                                                                                                      export const BlockEditor = Object.assign(BlockEditorRoot, {
                                                                                                                                                                                                                                                                        BubbleMenu,
                                                                                                                                                                                                                                                                          Content: BlockEditorContent,
                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                          