"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignIcon,
  DeleteEmbedIcon,
  EditUrlIcon,
  OpenInYouTubeIcon,
} from "../icons";

interface ResizableNodeViewProps extends NodeViewProps {
  children: React.ReactNode;
  lockAspect?: boolean;
  aspectRatio?: number;
  minWidth?: number;
  maxWidth?: number;
  videoSrc?: string;
  watchUrl?: string;
  onSrcChange?: (src: string) => void;
}

type ResizeDirection = "left" | "right" | "bottom" | "corner-bl" | "corner-br";

interface EmbedToolbarProps {
  align: string;
  videoSrc: string | undefined;
  watchUrl: string | undefined;
  deleteNode: (() => void) | undefined;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isEditingUrl: boolean;
  urlInput: string;
  setUrlInput: (v: string) => void;
  setIsEditingUrl: (v: boolean) => void;
  handleSaveUrl: () => void;
  handleApplyPreset: (pct: number) => void;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  nodeSrc: string | undefined;
}

const EmbedToolbar = ({
  align,
  videoSrc,
  watchUrl,
  deleteNode,
  inputRef,
  isEditingUrl,
  urlInput,
  setUrlInput,
  setIsEditingUrl,
  handleSaveUrl,
  handleApplyPreset,
  updateAttributes,
  nodeSrc,
}: EmbedToolbarProps) => {
  if (isEditingUrl) {
    return (
      <div className="rte-embed-selector-edit-form">
        <input
          ref={inputRef}
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube URL or video ID..."
          className="rte-embed-selector-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSaveUrl();
            } else if (e.key === "Escape") {
              setIsEditingUrl(false);
            }
          }}
        />
        <button
          type="button"
          onClick={handleSaveUrl}
          className="rte-embed-selector-btn rte-embed-selector-btn--save"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditingUrl(false)}
          className="rte-embed-selector-btn"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rte-embed-selector-group">
        {(["left", "center", "right"] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            title={`Align ${dir.charAt(0).toUpperCase()}${dir.slice(1)}`}
            aria-label={`Align ${dir.charAt(0).toUpperCase()}${dir.slice(1)}`}
            className={`rte-embed-selector-btn ${align === dir ? "rte-embed-selector-btn--active" : ""}`}
            onClick={() => updateAttributes({ align: dir })}
          >
            <AlignIcon dir={dir} />
          </button>
        ))}
      </div>

      <div className="rte-embed-selector-divider" />

      <div className="rte-embed-selector-group">
        {([25, 50, 75, 100] as const).map((pct) => (
          <button
            key={pct}
            type="button"
            title={`${pct}%`}
            className="rte-embed-selector-btn rte-embed-selector-btn--preset"
            onClick={() => handleApplyPreset(pct)}
          >
            {pct}%
          </button>
        ))}
      </div>

      <div className="rte-embed-selector-divider" />

      <div className="rte-embed-selector-group">
        {(videoSrc || nodeSrc) && (
          <button
            type="button"
            title="Edit URL"
            aria-label="Edit URL"
            className="rte-embed-selector-btn"
            onClick={() => {
              setUrlInput(videoSrc || nodeSrc || "");
              setIsEditingUrl(true);
            }}
          >
            <EditUrlIcon />
          </button>
        )}
        {watchUrl && (
          <button
            type="button"
            title="Open video in YouTube"
            aria-label="Open video in YouTube"
            className="rte-embed-selector-btn"
            onClick={() => window.open(watchUrl, "_blank")}
          >
            <OpenInYouTubeIcon />
          </button>
        )}
        {deleteNode && (
          <button
            type="button"
            title="Delete Embed"
            aria-label="Delete Embed"
            className="rte-embed-selector-btn rte-embed-selector-btn--danger"
            onClick={() => deleteNode()}
          >
            <DeleteEmbedIcon />
          </button>
        )}
      </div>
    </>
  );
};

export const ResizableNodeView = ({
  node,
  selected,
  updateAttributes,
  deleteNode,
  editor,
  view,
  children,
  lockAspect = false,
  aspectRatio = 16 / 9,
  minWidth = 300,
  maxWidth = 1200,
  videoSrc,
  watchUrl,
  onSrcChange,
}: ResizableNodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(videoSrc || "");
  const [isResizing, setIsResizing] = useState(false);
  const [currentDimensions, setCurrentDimensions] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const resizingRef = useRef<{
    direction: ResizeDirection;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    editorWidth: number;
  } | null>(null);

  const width = node.attrs.width as number | undefined;
  const height = node.attrs.height as number | undefined;
  const align = (node.attrs.align as string) || "center";

  const getEditorWidth = useCallback(
    () => view?.dom?.parentElement?.offsetWidth ?? 800,
    [view]
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingUrl) {
      inputRef.current?.focus();
    }
  }, [isEditingUrl]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const resize = resizingRef.current;
      if (!resize) {
        return;
      }

      const effectiveMax = Math.min(maxWidth, resize.editorWidth);

      let newWidth = resize.startWidth;
      let newHeight = resize.startHeight;

      if (resize.direction === "right" || resize.direction === "corner-br") {
        newWidth = Math.max(
          minWidth,
          Math.min(
            effectiveMax,
            resize.startWidth + (e.clientX - resize.startX)
          )
        );
      } else if (
        resize.direction === "left" ||
        resize.direction === "corner-bl"
      ) {
        newWidth = Math.max(
          minWidth,
          Math.min(
            effectiveMax,
            resize.startWidth - (e.clientX - resize.startX)
          )
        );
      }

      if (
        resize.direction === "bottom" ||
        resize.direction === "corner-br" ||
        resize.direction === "corner-bl"
      ) {
        newHeight = Math.max(
          Math.round(minWidth / aspectRatio),
          Math.min(
            Math.round(effectiveMax / aspectRatio),
            resize.startHeight + (e.clientY - resize.startY)
          )
        );
      }

      if (lockAspect) {
        if (
          resize.direction === "left" ||
          resize.direction === "right" ||
          resize.direction === "corner-br" ||
          resize.direction === "corner-bl"
        ) {
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newWidth = Math.round(newHeight * aspectRatio);
        }
      }

      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`;
        containerRef.current.style.height = `${newHeight}px`;
      }
      setCurrentDimensions({ h: newHeight, w: newWidth });
    },
    [lockAspect, aspectRatio, minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(
    function handleMouseUp() {
      const resize = resizingRef.current;
      if (!resize) {
        return;
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        updateAttributes({ height: h, width: w });
      }

      resizingRef.current = null;
      setIsResizing(false);
      setCurrentDimensions(null);
    },
    [handleMouseMove, updateAttributes]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();

      const editorWidth = getEditorWidth();
      const startWidth =
        containerRef.current?.offsetWidth ??
        width ??
        Math.min(560, editorWidth);
      const startHeight = containerRef.current?.offsetHeight ?? height ?? 315;

      resizingRef.current = {
        direction,
        editorWidth,
        startHeight,
        startWidth,
        startX: e.clientX,
        startY: e.clientY,
      };

      setIsResizing(true);
      setCurrentDimensions({ h: startHeight, w: startWidth });

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      const cursors: Record<ResizeDirection, string> = {
        bottom: "ns-resize",
        "corner-bl": "nesw-resize",
        "corner-br": "nwse-resize",
        left: "ew-resize",
        right: "ew-resize",
      };
      document.body.style.cursor = cursors[direction];
      document.body.style.userSelect = "none";
    },
    [width, height, getEditorWidth, handleMouseMove, handleMouseUp]
  );

  useEffect(
    () => () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [handleMouseMove, handleMouseUp]
  );

  const handleApplyPreset = (percent: number) => {
    const editorW = getEditorWidth() || 800;
    const targetW = Math.round(
      Math.max(minWidth, Math.min(maxWidth, (editorW * percent) / 100))
    );
    updateAttributes({
      height: Math.round(targetW / aspectRatio),
      width: targetW,
    });
  };

  const handleSaveUrl = () => {
    if (urlInput && onSrcChange) {
      onSrcChange(urlInput);
    } else if (urlInput) {
      updateAttributes({ src: urlInput });
    }
    setIsEditingUrl(false);
  };

  const isEditable = editor ? editor.isEditable : true;

  return (
    <NodeViewWrapper
      className="rte-embed-wrapper"
      data-selected={selected || undefined}
      data-align={align}
    >
      <div
        ref={containerRef}
        className="rte-embed"
        contentEditable={false}
        style={{
          height: height ? `${height}px` : "auto",
          minWidth: `${minWidth}px`,
          width: width ? `${width}px` : "100%",
        }}
      >
        {children}

        {selected && isEditable && (
          <div className="rte-embed-selector" contentEditable={false}>
            <EmbedToolbar
              align={align}
              videoSrc={videoSrc}
              watchUrl={watchUrl}
              deleteNode={deleteNode}
              inputRef={inputRef}
              isEditingUrl={isEditingUrl}
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              setIsEditingUrl={setIsEditingUrl}
              handleSaveUrl={handleSaveUrl}
              handleApplyPreset={handleApplyPreset}
              updateAttributes={updateAttributes}
              nodeSrc={node.attrs.src}
            />
          </div>
        )}

        {isResizing && currentDimensions && (
          <div className="rte-embed-resize-badge">
            {currentDimensions.w} × {currentDimensions.h} px
          </div>
        )}

        {selected && isEditable && (
          <>
            <div
              className="rte-resize-handle rte-resize-handle--left"
              onMouseDown={(e) => handleMouseDown(e, "left")}
              role="presentation"
            />
            <div
              className="rte-resize-handle rte-resize-handle--right"
              onMouseDown={(e) => handleMouseDown(e, "right")}
              role="presentation"
            />
            <div
              className="rte-resize-handle rte-resize-handle--bottom"
              onMouseDown={(e) => handleMouseDown(e, "bottom")}
              role="presentation"
            />
            <div
              className="rte-resize-handle rte-resize-handle--corner rte-resize-handle--corner-bl"
              onMouseDown={(e) => handleMouseDown(e, "corner-bl")}
              role="presentation"
            />
            <div
              className="rte-resize-handle rte-resize-handle--corner rte-resize-handle--corner-br"
              onMouseDown={(e) => handleMouseDown(e, "corner-br")}
              role="presentation"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
