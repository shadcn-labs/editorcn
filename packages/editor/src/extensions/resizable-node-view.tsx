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
import { cn } from "../ui/utils";

const SELECTOR_BUTTON =
  "rte-embed-selector-btn inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-sm border-none bg-transparent px-2 text-[0.75rem] font-medium text-popover-foreground [transition:background-color_150ms_ease-out,color_150ms_ease-out,scale_100ms_ease-out] hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring/50 focus-visible:-outline-offset-2 active:scale-96";

const SELECTOR_GROUP = "rte-embed-selector-group flex items-center gap-0.5";

const SELECTOR_DIVIDER =
  "rte-embed-selector-divider mx-0.5 h-4 w-px shrink-0 bg-border";

const HANDLE =
  "rte-resize-handle absolute z-10 opacity-0 group-data-selected/embed:opacity-100";

const EDGE_HANDLE = `${HANDLE} bg-transparent [transition:opacity_150ms_ease-out,background-color_150ms_ease-out] after:absolute after:rounded-[1px] after:bg-primary after:content-['']`;

const SIDE_HANDLE = `${EDGE_HANDLE} inset-y-0 w-1.5 cursor-ew-resize after:inset-x-px after:inset-y-1 after:w-0.5 after:[transition:width_150ms_ease-out,inset_150ms_ease-out] hover:after:inset-x-0 hover:after:w-1`;

const CORNER_HANDLE = `${HANDLE} rte-resize-handle--corner size-3 rounded-[3px] border-2 border-background bg-primary [transition:transform_150ms_ease-out] hover:[transform:scale(1.1)]`;

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
      <div className="rte-embed-selector-edit-form flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube URL or video ID..."
          className="rte-embed-selector-input h-8 w-[220px] rounded-md border border-[color:var(--input,var(--border))] bg-background px-2.5 text-[0.8125rem] text-foreground outline-none [transition:border-color_150ms_ease-out,box-shadow_150ms_ease-out] focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_50%,transparent)]"
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
          className={cn(
            SELECTOR_BUTTON,
            "rte-embed-selector-btn--save bg-primary px-2 text-primary-foreground hover:bg-primary/85 hover:text-primary-foreground"
          )}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditingUrl(false)}
          className={SELECTOR_BUTTON}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={SELECTOR_GROUP}>
        {(["left", "center", "right"] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            title={`Align ${dir.charAt(0).toUpperCase()}${dir.slice(1)}`}
            aria-label={`Align ${dir.charAt(0).toUpperCase()}${dir.slice(1)}`}
            className={cn(
              SELECTOR_BUTTON,
              align === dir &&
                "rte-embed-selector-btn--active bg-muted text-foreground"
            )}
            onClick={() => updateAttributes({ align: dir })}
          >
            <AlignIcon dir={dir} />
          </button>
        ))}
      </div>

      <div className={SELECTOR_DIVIDER} />

      <div className={SELECTOR_GROUP}>
        {([25, 50, 75, 100] as const).map((pct) => (
          <button
            key={pct}
            type="button"
            title={`${pct}%`}
            className={cn(
              SELECTOR_BUTTON,
              "rte-embed-selector-btn--preset text-[0.75rem] font-medium tabular-nums"
            )}
            onClick={() => handleApplyPreset(pct)}
          >
            {pct}%
          </button>
        ))}
      </div>

      <div className={SELECTOR_DIVIDER} />

      <div className={SELECTOR_GROUP}>
        {(videoSrc || nodeSrc) && (
          <button
            type="button"
            title="Edit URL"
            aria-label="Edit URL"
            className={SELECTOR_BUTTON}
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
            className={SELECTOR_BUTTON}
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
            className={cn(
              SELECTOR_BUTTON,
              "rte-embed-selector-btn--danger hover:bg-destructive/15 hover:text-destructive"
            )}
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
      className="rte-embed-wrapper group/embed"
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
          <div
            className="rte-embed-selector pointer-events-auto absolute top-[-46px] left-1/2 z-50 flex h-10 animate-rte-bubble-pop-in items-center gap-1 rounded-lg border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-popover px-1 whitespace-nowrap shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] [transform:translateX(-50%)]"
            contentEditable={false}
          >
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
          <div className="rte-embed-resize-badge pointer-events-none absolute right-2 bottom-2 z-40 rounded-sm bg-foreground/85 px-1.5 py-0.5 font-[family-name:var(--font-mono,monospace)] text-[0.75rem] font-medium text-background tabular-nums backdrop-blur-xs">
            {currentDimensions.w} × {currentDimensions.h} px
          </div>
        )}

        {selected && isEditable && (
          <>
            <div
              className={`${SIDE_HANDLE} rte-resize-handle--left -left-[3px]`}
              onMouseDown={(e) => handleMouseDown(e, "left")}
              role="presentation"
            />
            <div
              className={`${SIDE_HANDLE} rte-resize-handle--right -right-[3px]`}
              onMouseDown={(e) => handleMouseDown(e, "right")}
              role="presentation"
            />
            <div
              className={`${EDGE_HANDLE} rte-resize-handle--bottom inset-x-0 -bottom-[3px] h-1.5 cursor-ns-resize after:inset-x-1 after:bottom-px after:h-0.5 after:[transition:height_150ms_ease-out,bottom_150ms_ease-out] hover:after:bottom-0 hover:after:h-1`}
              onMouseDown={(e) => handleMouseDown(e, "bottom")}
              role="presentation"
            />
            <div
              className={`${CORNER_HANDLE} rte-resize-handle--corner-bl -bottom-[5px] -left-[5px] cursor-nesw-resize`}
              onMouseDown={(e) => handleMouseDown(e, "corner-bl")}
              role="presentation"
            />
            <div
              className={`${CORNER_HANDLE} rte-resize-handle--corner-br -right-[5px] -bottom-[5px] cursor-nwse-resize`}
              onMouseDown={(e) => handleMouseDown(e, "corner-br")}
              role="presentation"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
