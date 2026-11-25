import * as React from "react";
import { useCallback, useLayoutEffect, useState } from "react";

import { cn } from "./utils";

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

const useDropdownPill = (
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void,
  activeItem?: HTMLElement | null
): { handlers: DropdownPillHandlers; pill: React.ReactNode } => {
  const [rect, setRect] = useState<PillRect | null>(null);

  useLayoutEffect(() => {
    if (activeItem) {
      setRect(measure(activeItem));
    } else if (activeItem === null) {
      setRect(null);
    }
  }, [activeItem]);

  const handleItemEnter = useCallback((target: EventTarget | null) => {
    const item = (target as HTMLElement).closest<HTMLElement>(
      "[data-dropdown-item]"
    );
    if (!item) {
      return;
    }
    setRect(measure(item));
  }, []);

  const handlers: DropdownPillHandlers = {
    onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
      handleItemEnter(event.target);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => {
      setRect(activeItem ? measure(activeItem) : null);
      onMouseLeave?.(event);
    },
    onMouseOver: (event: React.MouseEvent<HTMLDivElement>) => {
      handleItemEnter(event.target);
    },
  };

  const pill = (
    <div
      aria-hidden="true"
      className={cn(
        "ext-dropdown-pill pointer-events-none absolute top-0 left-0 z-0 rounded-sm bg-primary/6 opacity-0 [transition:top_220ms_cubic-bezier(0.22,1,0.36,1),left_220ms_cubic-bezier(0.22,1,0.36,1),width_220ms_cubic-bezier(0.22,1,0.36,1),height_220ms_cubic-bezier(0.22,1,0.36,1),opacity_150ms_ease-out]",
        rect && "ext-dropdown-pill--visible opacity-100"
      )}
      style={
        rect
          ? {
              height: rect.height,
              left: rect.left,
              top: rect.top,
              width: rect.width,
            }
          : undefined
      }
    />
  );

  return { handlers, pill };
};

export { useDropdownPill };
