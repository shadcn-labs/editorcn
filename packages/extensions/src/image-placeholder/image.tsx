"use client";

import { Image as TiptapImage } from "@tiptap/extension-image";
import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Maximize2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@editorcn/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@editorcn/ui/components/dropdown-menu";
import { Separator } from "@editorcn/ui/components/separator";
import { cn } from "@editorcn/ui/lib/utils";

export const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "100%" },
      height: { default: null },
      align: { default: "center" },
    };
  },
  addNodeView: () => ReactNodeViewRenderer(ResizableImageNode),
}).configure({ allowBase64: true });

function ResizableImageNode({
  node,
  editor,
  selected,
  deleteNode,
  updateAttributes,
  getPos,
}: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [resizingPosition, setResizingPosition] = useState<"left" | "right">(
    "left"
  );
  const [resizeInitialWidth, setResizeInitialWidth] = useState(0);
  const [resizeInitialMouseX, setResizeInitialMouseX] = useState(0);
  const [openedMore, setOpenedMore] = useState(false);

  const resize = (event: MouseEvent) => {
    if (!resizing) return;
    let dx = event.clientX - resizeInitialMouseX;
    if (resizingPosition === "left") {
      dx = resizeInitialMouseX - event.clientX;
    }
    const newWidth = Math.max(resizeInitialWidth + dx, 150);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth || 0;
    if (newWidth < parentWidth) {
      updateAttributes({ width: newWidth });
    }
  };

  const endResize = () => {
    setResizing(false);
    setResizeInitialMouseX(0);
    setResizeInitialWidth(0);
  };

  const handleMouseDown = (position: "left" | "right") => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      setResizing(true);
      setResizingPosition(position);
      setResizeInitialMouseX(event.clientX);
      if (imageRef.current) {
        setResizeInitialWidth(imageRef.current.offsetWidth);
      }
    };
  };

  const handleTouchStart = (position: "left" | "right") => {
    return (event: React.TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      if (!touch) return;
      setResizing(true);
      setResizingPosition(position);
      setResizeInitialMouseX(touch.clientX);
      if (imageRef.current) {
        setResizeInitialWidth(imageRef.current.offsetWidth);
      }
    };
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!resizing) return;
    const touch = event.touches[0];
    if (!touch) return;
    let dx = touch.clientX - resizeInitialMouseX;
    if (resizingPosition === "left") {
      dx = resizeInitialMouseX - touch.clientX;
    }
    const newWidth = Math.max(resizeInitialWidth + dx, 150);
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth || 0;
    if (newWidth < parentWidth) {
      updateAttributes({ width: newWidth });
    }
  };

  const handleTouchEnd = () => {
    setResizing(false);
    setResizeInitialMouseX(0);
    setResizeInitialWidth(0);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", endResize);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", endResize);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [resizing, resizeInitialMouseX, resizeInitialWidth]);

  const duplicate = () => {
    const pos = getPos();
    if (typeof pos !== "number" || !editor || editor.isDestroyed) return;
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, node.toJSON())
      .run();
  };

  return (
    <NodeViewWrapper
      ref={nodeRef}
      className={cn(
        "group relative flex flex-col rounded-md",
        selected && "ring-2 ring-ring ring-offset-2",
        node.attrs.align === "left" && "left-0 -translate-x-0",
        node.attrs.align === "center" && "left-1/2 -translate-x-1/2",
        node.attrs.align === "right" && "left-full -translate-x-full"
      )}
      style={{ width: node.attrs.width }}
    >
      <img
        ref={imageRef}
        className="rounded-md"
        src={node.attrs.src}
        alt={node.attrs.alt}
        title={node.attrs.title}
      />
      {node.attrs.title ? (
        <NodeViewContent className="pt-1.5 text-center text-sm text-muted-foreground">
          {node.attrs.title}
        </NodeViewContent>
      ) : null}

      {editor?.isEditable && (
        <>
          <div
            className="absolute inset-y-0 z-20 flex w-4 cursor-col-resize items-center justify-start"
            style={{ left: 0 }}
            onMouseDown={handleMouseDown("left")}
            onTouchStart={handleTouchStart("left")}
          >
            <div
              className={cn(
                "h-16 w-1 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100",
                resizing && "opacity-100"
              )}
            />
          </div>
          <div
            className="absolute inset-y-0 z-20 flex w-4 cursor-col-resize items-center justify-end"
            style={{ right: 0 }}
            onMouseDown={handleMouseDown("right")}
            onTouchStart={handleTouchStart("right")}
          >
            <div
              className={cn(
                "h-16 w-1 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100",
                resizing && "opacity-100"
              )}
            />
          </div>
          <div
            className={cn(
              "absolute right-0 top-full mt-2 flex items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-md transition-opacity",
              !resizing && "opacity-0 group-hover:opacity-100",
              (selected || openedMore) && "opacity-100"
            )}
          >
            <Button
              className={cn(
                "size-7",
                node.attrs.align === "left" && "bg-accent text-accent-foreground"
              )}
              data-active={node.attrs.align === "left" || undefined}
              aria-label="Align left"
              size="icon"
              variant="ghost"
              onClick={() => updateAttributes({ align: "left" })}
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              className={cn(
                "size-7",
                node.attrs.align === "center" && "bg-accent text-accent-foreground"
              )}
              data-active={node.attrs.align === "center" || undefined}
              aria-label="Align center"
              size="icon"
              variant="ghost"
              onClick={() => updateAttributes({ align: "center" })}
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              className={cn(
                "size-7",
                node.attrs.align === "right" && "bg-accent text-accent-foreground"
              )}
              data-active={node.attrs.align === "right" || undefined}
              aria-label="Align right"
              size="icon"
              variant="ghost"
              onClick={() => updateAttributes({ align: "right" })}
            >
              <AlignRight className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <DropdownMenu open={openedMore} onOpenChange={setOpenedMore}>
              <DropdownMenuTrigger
                render={<Button aria-label="Image options" className="size-7" size="icon" variant="ghost" />}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-sm">
                <DropdownMenuItem onClick={duplicate}>
                  <Copy className="mr-2 size-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateAttributes({ width: "fit-content" })}
                >
                  <Maximize2 className="mr-2 size-4" /> Full width
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => deleteNode()}
                >
                  <Trash2 className="mr-2 size-4" /> Delete image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
}