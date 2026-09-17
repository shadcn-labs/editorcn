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

const clamp = (value: number, max: number): number =>
  Math.max(8, Math.min(value, Math.max(8, max)));

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
    const rect = trigger.getBoundingClientRect();
    const width = content.offsetWidth;
    const height = content.offsetHeight;

    let left: number | undefined;
    let top: number | undefined;
    let right: number | undefined;
    let bottom: number | undefined;
    const translate: string[] = [];

    if (side === "bottom" || side === "top") {
      if (side === "bottom") {
        top = clamp(rect.bottom + sideOffset, window.innerHeight - height);
      } else {
        bottom = window.innerHeight - rect.top + sideOffset;
      }
      if (align === "center") {
        left = clamp(rect.left + rect.width / 2, window.innerWidth - width);
        translate.push("translateX(-50%)");
      } else if (align === "end") {
        right = clamp(
          window.innerWidth - rect.right,
          window.innerWidth - width
        );
      } else {
        left = clamp(rect.left, window.innerWidth - width);
      }
    } else {
      if (side === "right") {
        left = clamp(rect.right + sideOffset, window.innerWidth - width);
      } else {
        right = window.innerWidth - rect.left + sideOffset;
      }
      if (align === "center") {
        top = clamp(rect.top + rect.height / 2, window.innerHeight - height);
        translate.push("translateY(-50%)");
      } else if (align === "end") {
        bottom = window.innerHeight - rect.bottom;
      } else {
        top = clamp(rect.top, window.innerHeight - height);
      }
    }

    content.style.left = left === undefined ? "" : `${left}px`;
    content.style.top = top === undefined ? "" : `${top}px`;
    content.style.right = right === undefined ? "" : `${right}px`;
    content.style.bottom = bottom === undefined ? "" : `${bottom}px`;
    content.style.transform = translate.join(" ");
  }, [align, side, sideOffset]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    applyPosition();
    const handleScroll = () => {
      applyPosition();
    };
    const handleResize = () => {
      applyPosition();
    };
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
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
