import * as React from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

export interface DropdownPillHandlers {
  onFocus: (event: React.FocusEvent<HTMLDivElement>) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOver: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface PillRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

const measure = (item: HTMLElement): PillRect => ({
  height: item.offsetHeight,
  left: item.offsetLeft,
  top: item.offsetTop,
  width: item.offsetWidth,
});

const VISIBLE_CLASSES = ["ext-dropdown-pill--visible", "opacity-100"];

const useDropdownPill = (
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void,
  activeItem?: HTMLElement | null
): { handlers: DropdownPillHandlers; pill: React.ReactNode } => {
  // The pill follows DOM measurements, so it is positioned imperatively
  // instead of through state: no setState inside effects, and hovering
  // items doesn't re-render the menu.
  const pillRef = useRef<HTMLDivElement>(null);

  const moveTo = useCallback((item: HTMLElement | null) => {
    const node = pillRef.current;
    if (!node) {
      return;
    }
    if (!item) {
      node.classList.remove(...VISIBLE_CLASSES);
      node.style.removeProperty("height");
      node.style.removeProperty("left");
      node.style.removeProperty("top");
      node.style.removeProperty("width");
      return;
    }
    const rect = measure(item);
    node.style.height = `${rect.height}px`;
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.classList.add(...VISIBLE_CLASSES);
  }, []);

  useLayoutEffect(() => {
    // undefined means "no active item tracking": leave the pill where it is.
    if (activeItem !== undefined) {
      moveTo(activeItem);
    }
  }, [activeItem, moveTo]);

  const handleItemEnter = useCallback(
    (target: EventTarget | null) => {
      const item = (target as HTMLElement).closest<HTMLElement>(
        "[data-dropdown-item]"
      );
      if (item) {
        moveTo(item);
      }
    },
    [moveTo]
  );

  const handlers: DropdownPillHandlers = {
    onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
      handleItemEnter(event.target);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => {
      moveTo(activeItem ?? null);
      onMouseLeave?.(event);
    },
    onMouseOver: (event: React.MouseEvent<HTMLDivElement>) => {
      handleItemEnter(event.target);
    },
  };

  const pill = (
    <div
      ref={pillRef}
      aria-hidden="true"
      className="ext-dropdown-pill pointer-events-none absolute top-0 left-0 z-0 rounded-sm bg-primary/6 opacity-0 [transition:top_220ms_cubic-bezier(0.22,1,0.36,1),left_220ms_cubic-bezier(0.22,1,0.36,1),width_220ms_cubic-bezier(0.22,1,0.36,1),height_220ms_cubic-bezier(0.22,1,0.36,1),opacity_150ms_ease-out]"
    />
  );

  return { handlers, pill };
};

export { useDropdownPill };
