import * as React from "react";
import { useCallback, useState } from "react";

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

const useDropdownPill = (
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void
): { handlers: DropdownPillHandlers; pill: React.ReactNode } => {
  const [rect, setRect] = useState<PillRect | null>(null);

  const handleItemEnter = useCallback((target: EventTarget | null) => {
    const item = (target as HTMLElement).closest<HTMLElement>(
      "[data-dropdown-item]"
    );
    if (!item) {
      return;
    }
    setRect({
      height: item.offsetHeight,
      left: item.offsetLeft,
      top: item.offsetTop,
      width: item.offsetWidth,
    });
  }, []);

  const handlers: DropdownPillHandlers = {
    onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
      handleItemEnter(event.target);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => {
      setRect(null);
      onMouseLeave?.(event);
    },
    onMouseOver: (event: React.MouseEvent<HTMLDivElement>) => {
      handleItemEnter(event.target);
    },
  };

  const pill = (
    <div
      aria-hidden="true"
      className={["ext-dropdown-pill", rect ? "ext-dropdown-pill--visible" : ""]
        .filter(Boolean)
        .join(" ")}
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
