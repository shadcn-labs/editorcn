import * as React from "react";

import { useFloating } from "./use-floating";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
  tooltip?: string;
}

const PlainButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      active = false,
      danger = false,
      tooltip: _tooltip,
      type = "button",
      ...props
    },
    ref
  ) => {
    const cls = [
      "ext-btn",
      active ? "ext-btn--active" : "",
      danger ? "ext-btn--danger" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

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
          <div className="ext-tooltip" role="tooltip">
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
