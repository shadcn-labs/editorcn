import * as React from "react";
import { useCallback, useRef, useState } from "react";

export interface BubbleDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "default" | "align" | "language";
}

const alignClass: Record<string, string> = {
  align: "block-editor-bubble-dropdown--align",
  default: "",
  language: "block-editor-bubble-dropdown--language",
};

const BubbleDropdown = React.forwardRef<HTMLDivElement, BubbleDropdownProps>(
  (
    { className = "", align = "default", children, onMouseLeave, ...props },
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

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        setPill(null);
        onMouseLeave?.(event);
      },
      [onMouseLeave]
    );

    const cls = ["block-editor-bubble-dropdown", alignClass[align], className]
      .filter(Boolean)
      .join(" ");

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
          className={[
            "block-editor-bubble-dropdown-pill",
            pill ? "block-editor-bubble-dropdown-pill--visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
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
