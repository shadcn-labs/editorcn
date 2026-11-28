import * as React from "react";
import { useCallback, useRef, useState } from "react";

import { cn } from "./utils";

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "language" | "color";
}

const variantClass: Record<string, string> = {
  color:
    "rte-bubble-dropdown--color min-w-auto p-2 [&_.rte-bubble-dropdown-divider]:mx-[-0.5rem] [&_.rte-bubble-dropdown-divider]:mt-2.5 [&_.rte-bubble-dropdown-divider]:mb-2",
  default: "",
  language:
    "rte-bubble-dropdown--language max-h-80 min-w-40 overflow-y-auto [scrollbar-width:thin]",
};

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    { className, variant = "default", children, onMouseLeave, ...props },
    ref
  ) => {
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

    const handleMouseLeaveFn = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        setPill(null);
        onMouseLeave?.(event);
      },
      [onMouseLeave]
    );

    const cls = cn(
      "rte-bubble-dropdown absolute top-full left-0 z-1000 mt-1.5 min-w-40 origin-top-left animate-rte-bubble-pop-in rounded-lg border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-popover p-1 text-popover-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]",
      variantClass[variant],
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
        onMouseLeave={handleMouseLeaveFn}
        onMouseOver={handleMouseOver}
        {...props}
      >
        <div
          aria-hidden="true"
          className={cn(
            "rte-bubble-dropdown-pill pointer-events-none absolute top-0 left-0 z-0 rounded-sm bg-muted opacity-0 [transition:top_180ms_ease-out,left_180ms_ease-out,width_180ms_ease-out,height_180ms_ease-out,opacity_150ms_ease-out]",
            pill && "rte-bubble-dropdown-pill--visible opacity-100"
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
Dropdown.displayName = "Dropdown";

export { Dropdown };
