import * as React from "react";

import { useTooltip } from "./tooltip";
import type { TooltipSide } from "./tooltip";
import { cn } from "./utils";

export type ButtonSize = "default" | "icon" | "icon-sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
  size?: ButtonSize;
  tooltip?: string;
  tooltipSide?: TooltipSide;
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-2.5",
  icon: "ext-btn--icon w-8 px-0",
  "icon-sm": "ext-btn--icon-sm w-7 px-0",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      active = false,
      danger = false,
      size = "default",
      tooltip,
      tooltipSide,
      type = "button",
      onBlur,
      onFocus,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      ...props
    },
    ref
  ) => {
    const tooltipHandlers = useTooltip(tooltip, tooltipSide);

    const cls = cn(
      "ext-btn inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent text-[0.8125rem] font-medium whitespace-nowrap text-inherit outline-none [transition:background-color_150ms_ease-out,color_150ms_ease-out,border-color_150ms_ease-out,scale_100ms_ease-out] hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-96 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      sizeClasses[size],
      active && "ext-btn--active bg-accent text-accent-foreground",
      danger &&
        "ext-btn--danger text-destructive hover:bg-destructive/10 hover:text-destructive",
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        className={cls}
        data-state={active ? "on" : "off"}
        aria-label={props["aria-label"] ?? tooltip}
        aria-pressed={active}
        onBlur={(event) => {
          tooltipHandlers?.onBlur(event);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          tooltipHandlers?.onFocus(event);
          onFocus?.(event);
        }}
        onPointerDown={(event) => {
          tooltipHandlers?.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onPointerEnter={(event) => {
          tooltipHandlers?.onPointerEnter(event);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          tooltipHandlers?.onPointerLeave(event);
          onPointerLeave?.(event);
        }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
