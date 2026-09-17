import * as React from "react";
import { useCallback, useRef, useState } from "react";

export interface RteDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "language" | "color";
}

const variantClass: Record<string, string> = {
  color: "rte-bubble-dropdown--color",
  default: "",
  language: "rte-bubble-dropdown--language",
};

const RteDropdown = React.forwardRef<HTMLDivElement, RteDropdownProps>(
  (
    { className = "", variant = "default", children, onMouseLeave, ...props },
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

    const cls = ["rte-bubble-dropdown", variantClass[variant], className]
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
        onMouseLeave={handleMouseLeaveFn}
        onMouseOver={handleMouseOver}
        {...props}
      >
        <div
          aria-hidden="true"
          className={[
            "rte-bubble-dropdown-pill",
            pill ? "rte-bubble-dropdown-pill--visible" : "",
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
RteDropdown.displayName = "RteDropdown";

export { RteDropdown };
