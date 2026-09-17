"use client";

import { Image as TiptapImage } from "@tiptap/extension-image";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
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
import { createPortal } from "react-dom";

import { Button } from "../ui/button";
import { DropdownMenuContent } from "../ui/dropdown-content";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { DropdownMenu } from "../ui/dropdown-menu";
import { DropdownMenuSeparator } from "../ui/dropdown-separator";
import { Separator } from "../ui/separator";

const ResizableImageNode = ({
  node,
  editor,
  selected,
  deleteNode,
  updateAttributes,
  getPos,
}: NodeViewProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const [resizingPosition, setResizingPosition] = useState<"left" | "right">(
    "left"
  );
  const [resizeInitialWidth, setResizeInitialWidth] = useState(0);
  const [resizeInitialMouseX, setResizeInitialMouseX] = useState(0);
  const [openedMore, setOpenedMore] = useState(false);
  const [actionBarRect, setActionBarRect] = useState<{
    top: number;
    right: number;
  } | null>(null);

  useEffect(() => {
    if (!selected || resizing) {
      return;
    }
    let frame = 0;
    const loop = () => {
      const el = nodeRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setActionBarRect({ right: rect.right, top: rect.bottom + 12 });
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [selected, resizing]);

  const resize = (event: MouseEvent) => {
    if (!resizing) {
      return;
    }
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

  const handleMouseDown =
    (position: "left" | "right") =>
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      setResizing(true);
      setResizingPosition(position);
      setResizeInitialMouseX(event.clientX);
      if (imageRef.current) {
        setResizeInitialWidth(imageRef.current.offsetWidth);
      }
    };

  const handleTouchStart =
    (position: "left" | "right") => (event: React.TouchEvent) => {
      event.preventDefault();
      const touch = event.touches.item(0);
      if (!touch) {
        return;
      }
      setResizing(true);
      setResizingPosition(position);
      setResizeInitialMouseX(touch.clientX);
      if (imageRef.current) {
        setResizeInitialWidth(imageRef.current.offsetWidth);
      }
    };

  const handleTouchMove = (event: TouchEvent) => {
    if (!resizing) {
      return;
    }
    const touch = event.touches.item(0);
    if (!touch) {
      return;
    }
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
  }, [
    resizing,
    resizeInitialMouseX,
    resizeInitialWidth,
    resize,
    handleTouchMove,
  ]);

  const duplicate = () => {
    const pos = getPos();
    if (typeof pos !== "number" || !editor || editor.isDestroyed) {
      return;
    }
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, node.toJSON())
      .run();
  };

  const viewClass = [
    "ext-image-view",
    node.attrs.align === "left" ? "ext-image-view--left" : "",
    node.attrs.align === "center" ? "ext-image-view--center" : "",
    node.attrs.align === "right" ? "ext-image-view--right" : "",
    selected ? "ext-image-view--selected" : "",
    resizing ? "ext-image-view--resizing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <NodeViewWrapper
        ref={nodeRef}
        className={viewClass}
        style={{ width: node.attrs.width }}
      >
        <img
          ref={imageRef}
          className="ext-image-view-img"
          src={node.attrs.src}
          alt={node.attrs.alt}
          title={node.attrs.title}
        />
        {node.attrs.title ? (
          <NodeViewContent className="ext-image-view-caption">
            {node.attrs.title}
          </NodeViewContent>
        ) : null}

        {editor?.isEditable && (
          <>
            <div
              className="ext-image-resize ext-image-resize--left"
              onMouseDown={handleMouseDown("left")}
              onTouchStart={handleTouchStart("left")}
            >
              <div className="ext-image-resize-bar" />
            </div>
            <div
              className="ext-image-resize ext-image-resize--right"
              onMouseDown={handleMouseDown("right")}
              onTouchStart={handleTouchStart("right")}
            >
              <div className="ext-image-resize-bar" />
            </div>
          </>
        )}
      </NodeViewWrapper>

      {editor?.isEditable &&
        selected &&
        actionBarRect &&
        !resizing &&
        createPortal(
          <div
            className="ext-image-actions ext-image-actions--floating"
            style={{
              right: window.innerWidth - actionBarRect.right,
              top: actionBarRect.top,
            }}
          >
            <Button
              active={node.attrs.align === "left"}
              aria-label="Align left"
              className="ext-image-action-btn"
              onClick={() => updateAttributes({ align: "left" })}
            >
              <AlignLeft />
            </Button>
            <Button
              active={node.attrs.align === "center"}
              aria-label="Align center"
              className="ext-image-action-btn"
              onClick={() => updateAttributes({ align: "center" })}
            >
              <AlignCenter />
            </Button>
            <Button
              active={node.attrs.align === "right"}
              aria-label="Align right"
              className="ext-image-action-btn"
              onClick={() => updateAttributes({ align: "right" })}
            >
              <AlignRight />
            </Button>
            <Separator orientation="vertical" />
            <DropdownMenu
              open={openedMore}
              onOpenChange={setOpenedMore}
              trigger={
                <Button
                  aria-label="Image options"
                  className="ext-image-action-btn"
                >
                  <MoreHorizontal />
                </Button>
              }
            >
              <DropdownMenuContent className="ext-image-more-content">
                <DropdownMenuItem onClick={duplicate}>
                  <Copy />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateAttributes({ width: "fit-content" })}
                >
                  <Maximize2 />
                  Full width
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  danger
                  onClick={() => {
                    setOpenedMore(false);
                    deleteNode();
                  }}
                >
                  <Trash2 />
                  Delete image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>,
          document.body
        )}
    </>
  );
};

export const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      align: { default: "center" },
      alt: { default: null },
      height: { default: null },
      src: { default: null },
      title: { default: null },
      width: { default: "100%" },
    };
  },
  addNodeView: () => ReactNodeViewRenderer(ResizableImageNode),
}).configure({ allowBase64: true });
