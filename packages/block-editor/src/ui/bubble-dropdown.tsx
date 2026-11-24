import * as React from "react";
import { useCallback, useRef, useState } from "react";

import { cn } from "../lib/utils";

export interface BubbleDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "default" | "align" | "language";
}

const alignClass: Record<string, string> = {
  align: "block-editor-bubble-dropdown--align min-w-[130px]",
  default: "",
  language:
    "block-editor-bubble-dropdown--language max-h-80 min-w-40 overflow-y-auto [scrollbar-width:thin]",
};

const BubbleDropdown = React.forwardRef<HTMLDivElement, BubbleDropdownProps>(
  ({ className, align = "default", children, onMouseLeave, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pill, setPill] = useState<{
      height: number;
      left: number;
      top: number;
      width: number;
    } | null>(null);

    const handleItemEnter = useCallback((target: EventTarget | null) => {
      const item = (target as HTMLElement).closest<HTMLElement>(
        "[data-dropdown-item]"
      );
      if (!item) {
        return;
      }
      setPill({
        height: item.offsetHeight,
        left: item.offsetLeft,
        top: item.offsetTop,
        width: item.offsetWidth,
      });
    }, []);

    const handleMouseOver = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        handleItemEnter(event.target);
      },
      [handleItemEnter]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        handleItemEnter(event.target);
      },
      [handleItemEnter]
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        setPill(null);
        onMouseLeave?.(event);
      },
      [onMouseLeave]
    );

    const cls = cn(
      "block-editor-bubble-dropdown absolute top-full left-0 z-1000 mt-1 min-w-[150px] origin-top-left animate-block-editor-bubble-pop-in rounded-lg border border-border bg-popover p-1 shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
      alignClass[align],
      className
    );

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cls}
        onFocus={handleFocus}
        onMouseLeave={handleMouseLeave}
        onMouseOver={handleMouseOver}
        {...props}
      >
        <div
          aria-hidden="true"
          className={cn(
            "block-editor-bubble-dropdown-pill pointer-events-none absolute top-0 left-0 z-0 rounded-sm bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] opacity-0 [transition:top_220ms_cubic-bezier(0.22,1,0.36,1),left_220ms_cubic-bezier(0.22,1,0.36,1),width_220ms_cubic-bezier(0.22,1,0.36,1),height_220ms_cubic-bezier(0.22,1,0.36,1),opacity_150ms_ease-out]",
            pill && "block-editor-bubble-dropdown-pill--visible opacity-100"
          )}
          style={
            pill
              ? {
                  height: pill.height,
                  left: pill.left,
                  top: pill.top,
                  width: pill.width,
                }
              : undefined
          }
        />
        {children}
      </div>
    );
  }
);
BubbleDropdown.displayName = "BubbleDropdown";

export { BubbleDropdown };
