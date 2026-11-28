"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactNode, ReactPortal } from "react";
import { createPortal } from "react-dom";

export type FloatingSide = "bottom" | "top" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";

export interface UseFloatingOptions {
  align?: FloatingAlign;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  side?: FloatingSide;
  sideOffset?: number;
}

const VIEWPORT_MARGIN = 8;

const SLIDE: Record<FloatingSide, [string, string]> = {
  bottom: ["0", "-0.5rem"],
  left: ["0.5rem", "0"],
  right: ["-0.5rem", "0"],
  top: ["0", "0.5rem"],
};

const fit = (value: number, size: number, limit: number): number =>
  Math.max(VIEWPORT_MARGIN, Math.min(value, limit - size - VIEWPORT_MARGIN));

const alignOn = (
  align: FloatingAlign,
  start: number,
  length: number,
  size: number
): number => {
  if (align === "start") {
    return start;
  }
  if (align === "end") {
    return start + length - size;
  }
  return start + length / 2 - size / 2;
};

const resolveSide = (
  side: FloatingSide,
  rect: DOMRect,
  width: number,
  height: number,
  offset: number
): FloatingSide => {
  const room = {
    bottom: window.innerHeight - rect.bottom - offset - VIEWPORT_MARGIN,
    left: rect.left - offset - VIEWPORT_MARGIN,
    right: window.innerWidth - rect.right - offset - VIEWPORT_MARGIN,
    top: rect.top - offset - VIEWPORT_MARGIN,
  };
  const opposite: Record<FloatingSide, FloatingSide> = {
    bottom: "top",
    left: "right",
    right: "left",
    top: "bottom",
  };
  const need = side === "bottom" || side === "top" ? height : width;
  const flipped = opposite[side];
  return room[side] < need && room[flipped] > room[side] ? flipped : side;
};

export const useFloating = ({
  align = "center",
  onOpenChange,
  open,
  side = "bottom",
  sideOffset = 4,
}: UseFloatingOptions) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const applyPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!(trigger instanceof HTMLElement) || !content) {
      return;
    }
    if (!trigger.isConnected) {
      close();
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const width = content.offsetWidth;
    const height = content.offsetHeight;
    const resolved = resolveSide(side, rect, width, height, sideOffset);

    let left: number;
    let top: number;
    if (resolved === "bottom" || resolved === "top") {
      top =
        resolved === "bottom"
          ? rect.bottom + sideOffset
          : rect.top - sideOffset - height;
      left = alignOn(align, rect.left, rect.width, width);
    } else {
      left =
        resolved === "right"
          ? rect.right + sideOffset
          : rect.left - sideOffset - width;
      top = alignOn(align, rect.top, rect.height, height);
    }

    const [slideX, slideY] = SLIDE[resolved];
    content.style.left = `${fit(left, width, window.innerWidth)}px`;
    content.style.top = `${fit(top, height, window.innerHeight)}px`;
    content.style.setProperty("--ext-slide-x", slideX);
    content.style.setProperty("--ext-slide-y", slideY);
    content.dataset.side = resolved;
  }, [align, close, side, sideOffset]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    applyPosition();
    let frame: number;
    const follow = () => {
      applyPosition();
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [applyPosition, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (triggerRef.current?.contains(target) ||
          contentRef.current?.contains(target))
      ) {
        return;
      }
      close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [close, open]);

  const content = (children: ReactNode): null | ReactPortal =>
    open
      ? createPortal(
          <div
            ref={contentRef}
            data-ext-floating
            style={{ position: "fixed", zIndex: 60 } as CSSProperties}
          >
            {children}
          </div>,
          document.body
        )
      : null;

  return { content, triggerRef };
};
