import * as React from "react";

import { useFloating } from "./use-floating";
import { cn } from "./utils";

export type ButtonSize = "default" | "icon" | "icon-sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
  size?: ButtonSize;
  tooltip?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-2.5",
  icon: "ext-btn--icon w-8 px-0",
  "icon-sm": "ext-btn--icon-sm w-7 px-0",
};

const PlainButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      active = false,
      danger = false,
      size = "default",
      tooltip: _tooltip,
      type = "button",
      ...props
    },
    ref
  ) => {
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
        aria-pressed={active}
        {...props}
      />
    );
  }
);
PlainButton.displayName = "PlainButton";

const TooltipButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      tooltip,
      onBlur,
      onFocus,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const { content, triggerRef } = useFloating({
      onOpenChange: setOpen,
      open,
      sideOffset: 6,
    });

    const setRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <>
        <PlainButton
          ref={setRef}
          onBlur={(event) => {
            setOpen(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setOpen(event.currentTarget.matches(":focus-visible"));
            onFocus?.(event);
          }}
          onPointerDown={(event) => {
            setOpen(false);
            onPointerDown?.(event);
          }}
          onPointerEnter={(event) => {
            setOpen(true);
            onPointerEnter?.(event);
          }}
          onPointerLeave={(event) => {
            setOpen(false);
            onPointerLeave?.(event);
          }}
          {...props}
        />
        {content(
          <div
            className="ext-tooltip pointer-events-none animate-[ext-pop-in_0.12s_ease-out_forwards] rounded-none bg-foreground px-3 py-1.5 text-xs whitespace-nowrap text-background"
            role="tooltip"
          >
            {tooltip}
          </div>
        )}
      </>
    );
  }
);
TooltipButton.displayName = "TooltipButton";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) =>
  props.tooltip ? (
    <TooltipButton ref={ref} {...props} />
  ) : (
    <PlainButton ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button };
